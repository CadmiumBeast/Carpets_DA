const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const SubCategory = require('../models/SubCategory');
const Customer = require('../models/Customer');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { generateQuotationCalculation } = require('../utils/wasteCalculation');

// GET all quotations with aggregation pipeline (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status, customerId, assignedTo } = req.query;
        const matchStage = {};
        
        if (status) matchStage.status = status;
        if (customerId) matchStage.customerId = require('mongoose').Types.ObjectId(customerId);
        if (assignedTo) matchStage.assignedTo = require('mongoose').Types.ObjectId(assignedTo);
        
        const quotations = await Quotation.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedUser'
                }
            },
            { $unwind: { path: '$assignedUser', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    quotationNumber: 1,
                    'customer.fullName': 1,
                    'customer.email': 1,
                    'customer.phone': 1,
                    totalAmount: 1,
                    status: 1,
                    quotationDate: 1,
                    validUntil: 1,
                    'assignedUser.fullName': 1,
                    itemCount: { $size: '$items' },
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET quotation statistics/analytics (admin only)
router.get('/analytics/summary', authMiddleware, adminOnly, async (req, res) => {
    try {
        const stats = await Quotation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$totalAmount' },
                    avgValue: { $avg: '$totalAmount' }
                }
            }
        ]);
        
        const monthlyStats = await Quotation.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$quotationDate' },
                        month: { $month: '$quotationDate' }
                    },
                    count: { $sum: 1 },
                    totalValue: { $sum: '$totalAmount' },
                    accepted: {
                        $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);
        
        res.json({ byStatus: stats, monthly: monthlyStats });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET single quotation with full details (admin only)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('customerId')
            .populate('assignedTo', '-password')
            .populate('items.subCategoryId');
        
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        
        res.json(quotation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create quotation request (PUBLIC - no auth required)
router.post('/request', async (req, res) => {
    try {
        const { 
            customerName, 
            email, 
            phone,
            subCategoryId,
            roomLength,
            roomWidth,
            installationRequired,
            pattern,
            sealing,
            obstaclePercentage,
            notes,
            items
        } = req.body;
        
        if (!customerName || !email || !phone) {
            return res.status(400).json({ message: 'Customer name, email, and phone are required' });
        }
        
        if (!subCategoryId && (!items || items.length === 0)) {
            return res.status(400).json({ message: 'At least one product is required' });
        }
        
        // Find or create customer
        let customer = await Customer.findOne({ email: email.toLowerCase() });
        
        if (!customer) {
            customer = new Customer({
                fullName: customerName,
                email: email.toLowerCase(),
                phone,
                status: 'Inquiry'
            });
            await customer.save();
        }
        
        // Get subcategory for pricing
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Calculate measurements and pricing
        const length = parseFloat(roomLength) || 0;
        const width = parseFloat(roomWidth) || 0;
        const baseArea = length * width;
        
        // Calculate waste percentage
        let wastePercentage = 5; // Base 5%
        if (pattern === 'pattern') wastePercentage += 5;
        if (sealing) wastePercentage += 3;
        wastePercentage += parseInt(obstaclePercentage) || 0;
        wastePercentage = Math.min(wastePercentage, 35);
        
        const wasteArea = (baseArea * wastePercentage) / 100;
        const totalArea = baseArea + wasteArea;
        
        // Calculate costs
        const materialCost = totalArea * subCategory.price;
        const installationCost = installationRequired 
            ? totalArea * (200 + (totalArea > 50 ? 50 : 0))
            : 0;
        const subtotal = materialCost + installationCost;
        const tax = subtotal * 0.1; // 10% tax
        const totalAmount = subtotal + tax;
        
        // Generate quotation number
        const count = await Quotation.countDocuments();
        const quotationNumber = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
        
        // Create quotation
        const quotation = new Quotation({
            quotationNumber,
            customerId: customer._id,
            measurements: {
                dimensions: {
                    length,
                    width,
                    unit: 'ft'
                },
                totalSqFt: totalArea
            },
            items: [{
                subCategoryId: subCategory._id,
                quantity: totalArea,
                unitPrice: subCategory.price,
                totalPrice: materialCost
            }],
            subtotal,
            tax,
            totalAmount,
            quotationDate: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'Draft',
            internalNotes: notes ? `Customer notes: ${notes}\nInstallation: ${installationRequired ? 'Required' : 'Not required'}\nPattern: ${pattern}\nSealing: ${sealing ? 'Yes' : 'No'}\nObstacle %: ${obstaclePercentage || 0}%` : ''
        });
        
        await quotation.save();
        
        // Populate and return
        const populatedQuotation = await Quotation.findById(quotation._id)
            .populate('customerId')
            .populate('items.subCategoryId');
        
        res.status(201).json({
            message: 'Quotation request submitted successfully',
            quotationNumber: quotation.quotationNumber,
            quotation: populatedQuotation
        });
    } catch (error) {
        console.error('Quotation request error:', error);
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// POST create new quotation with automatic calculation (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { 
            customerId, 
            siteVisit,
            measurements,
            items, // Array of { subCategoryId, quantity, carpetSpecs, installationOptions }
            validUntil,
            notes
        } = req.body;
        
        if (!customerId) {
            return res.status(400).json({ message: 'Customer is required' });
        }
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        
        // Generate quotation number
        const count = await Quotation.countDocuments();
        const quotationNumber = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
        
        // Calculate items with waste and pricing
        const calculatedItems = await Promise.all(items.map(async (item) => {
            const subCategory = await SubCategory.findById(item.subCategoryId);
            if (!subCategory) {
                throw new Error(`SubCategory ${item.subCategoryId} not found`);
            }
            
            // Use waste calculation if measurements provided
            let unitPrice = item.unitPrice || subCategory.price;
            let totalPrice = unitPrice * (item.quantity || 1);
            
            // If measurements provided, calculate with waste
            if (measurements && measurements.dimensions) {
                const calculation = generateQuotationCalculation({
                    measurements,
                    carpetSpecs: item.carpetSpecs || {},
                    unitPrice: subCategory.price,
                    installationOptions: item.installationOptions || {}
                });
                
                totalPrice = calculation.summary.total;
                unitPrice = subCategory.price;
                
                // Store calculation details in item
                item.calculationDetails = calculation;
            }
            
            return {
                subCategoryId: item.subCategoryId,
                quantity: item.quantity || 1,
                unitPrice,
                totalPrice,
                calculationDetails: item.calculationDetails
            };
        }));
        
        // Calculate totals
        const subtotal = calculatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * 0.0; // Adjust tax rate as needed
        const totalAmount = subtotal + tax;
        
        // Create quotation
        const quotation = new Quotation({
            quotationNumber,
            customerId,
            siteVisit,
            measurements,
            items: calculatedItems,
            subtotal,
            tax,
            totalAmount,
            quotationDate: new Date(),
            validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
            assignedTo: req.userId,
            notes
        });
        
        await quotation.save();
        
        // Populate and return
        const populatedQuotation = await Quotation.findById(quotation._id)
            .populate('customerId')
            .populate('assignedTo', '-password')
            .populate('items.subCategoryId');
        
        res.status(201).json(populatedQuotation);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PUT update quotation (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        
        const { status, items, measurements, siteVisit, validUntil, notes } = req.body;
        
        // Update allowed fields
        if (status) quotation.status = status;
        if (validUntil) quotation.validUntil = validUntil;
        if (notes !== undefined) quotation.notes = notes;
        if (siteVisit) quotation.siteVisit = siteVisit;
        if (measurements) quotation.measurements = measurements;
        
        // Recalculate if items changed
        if (items) {
            const calculatedItems = await Promise.all(items.map(async (item) => {
                const subCategory = await SubCategory.findById(item.subCategoryId);
                if (!subCategory) {
                    throw new Error(`SubCategory ${item.subCategoryId} not found`);
                }
                
                let unitPrice = item.unitPrice || subCategory.price;
                let totalPrice = unitPrice * (item.quantity || 1);
                
                if (measurements && measurements.dimensions) {
                    const calculation = generateQuotationCalculation({
                        measurements,
                        carpetSpecs: item.carpetSpecs || {},
                        unitPrice: subCategory.price,
                        installationOptions: item.installationOptions || {}
                    });
                    totalPrice = calculation.summary.total;
                }
                
                return {
                    subCategoryId: item.subCategoryId,
                    quantity: item.quantity || 1,
                    unitPrice,
                    totalPrice
                };
            }));
            
            quotation.items = calculatedItems;
            quotation.subtotal = calculatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
            quotation.tax = quotation.subtotal * 0.0;
            quotation.totalAmount = quotation.subtotal + quotation.tax;
        }
        
        await quotation.save();
        
        const updated = await Quotation.findById(quotation._id)
            .populate('customerId')
            .populate('assignedTo', '-password')
            .populate('items.subCategoryId');
        
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PATCH update quotation status (admin only)
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const quotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('customerId').populate('items.subCategoryId');
        
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        
        res.json(quotation);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// DELETE quotation (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndDelete(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
