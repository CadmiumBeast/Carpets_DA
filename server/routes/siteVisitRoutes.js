const express = require('express');
const router = express.Router();
const SiteVisit = require('../models/SiteVisit');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// GET all site visits with aggregation (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status, customerId, assignedInstaller, startDate, endDate } = req.query;
        const matchStage = {};
        
        if (status) matchStage.status = status;
        if (customerId) matchStage.customerId = require('mongoose').Types.ObjectId(customerId);
        if (assignedInstaller) matchStage.assignedInstaller = require('mongoose').Types.ObjectId(assignedInstaller);
        
        if (startDate || endDate) {
            matchStage.scheduledDate = {};
            if (startDate) matchStage.scheduledDate.$gte = new Date(startDate);
            if (endDate) matchStage.scheduledDate.$lte = new Date(endDate);
        }
        
        const siteVisits = await SiteVisit.aggregate([
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
                    localField: 'assignedInstaller',
                    foreignField: '_id',
                    as: 'installer'
                }
            },
            { $unwind: { path: '$installer', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    'customer.fullName': 1,
                    'customer.phone': 1,
                    'customer.address': 1,
                    scheduledDate: 1,
                    status: 1,
                    'measurements.roomName': 1,
                    'measurements.totalSqFt': 1,
                    'installer.fullName': 1,
                    siteNotes: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            { $sort: { scheduledDate: 1 } }
        ]);
        
        res.json(siteVisits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET site visit statistics (admin only)
router.get('/analytics/summary', authMiddleware, adminOnly, async (req, res) => {
    try {
        const stats = await SiteVisit.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgSqFt: { $avg: '$measurements.totalSqFt' }
                }
            }
        ]);
        
        const byInstaller = await SiteVisit.aggregate([
            { $match: { assignedInstaller: { $ne: null } } },
            {
                $group: {
                    _id: '$assignedInstaller',
                    totalVisits: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'installer'
                }
            },
            { $unwind: '$installer' },
            {
                $project: {
                    'installer.fullName': 1,
                    'installer.username': 1,
                    totalVisits: 1,
                    completed: 1,
                    completionRate: {
                        $multiply: [
                            { $divide: ['$completed', '$totalVisits'] },
                            100
                        ]
                    }
                }
            }
        ]);
        
        const upcoming = await SiteVisit.countDocuments({
            scheduledDate: { $gte: new Date() },
            status: 'Scheduled'
        });
        
        res.json({ byStatus: stats, byInstaller, upcomingVisits: upcoming });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET upcoming site visits (admin only)
router.get('/upcoming', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(days));
        
        const visits = await SiteVisit.find({
            scheduledDate: {
                $gte: new Date(),
                $lte: endDate
            },
            status: 'Scheduled'
        })
        .populate('customerId')
        .populate('assignedInstaller', '-password')
        .sort({ scheduledDate: 1 });
        
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET single site visit (admin only)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const siteVisit = await SiteVisit.findById(req.params.id)
            .populate('customerId')
            .populate('assignedInstaller', '-password');
        
        if (!siteVisit) {
            return res.status(404).json({ message: 'Site visit not found' });
        }
        
        res.json(siteVisit);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET site visits by customer (admin only)
router.get('/customer/:customerId', authMiddleware, adminOnly, async (req, res) => {
    try {
        const visits = await SiteVisit.find({ customerId: req.params.customerId })
            .populate('assignedInstaller', '-password')
            .sort({ scheduledDate: -1 });
        
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create site visit booking request (PUBLIC - no auth required)
router.post('/request', async (req, res) => {
    try {
        const { 
            customerName,
            email,
            phone,
            address,
            preferredDate,
            preferredTime,
            roomLength,
            roomWidth,
            roomType,
            notes
        } = req.body;
        
        if (!customerName || !email || !phone || !address || !preferredDate) {
            return res.status(400).json({ message: 'Name, email, phone, address, and preferred date are required' });
        }
        
        // Find or create customer
        let customer = await Customer.findOne({ email: email.toLowerCase() });
        
        if (!customer) {
            customer = new Customer({
                fullName: customerName,
                email: email.toLowerCase(),
                phone,
                address,
                status: 'Inquiry'
            });
            await customer.save();
        } else {
            // Update customer info if changed
            customer.phone = phone;
            customer.address = address;
            await customer.save();
        }
        
        // Create measurements if provided
        let measurements = {};
        if (roomLength && roomWidth) {
            const length = parseFloat(roomLength);
            const width = parseFloat(roomWidth);
            const totalSqFt = length * width;
            
            measurements = {
                dimensions: {
                    length,
                    width,
                    unit: 'ft'
                },
                totalSqFt: Math.round(totalSqFt * 100) / 100
            };
        }
        
        // Combine date and time
        const scheduledDateTime = new Date(preferredDate);
        if (preferredTime) {
            const [hours, minutes] = preferredTime.split(':');
            scheduledDateTime.setHours(parseInt(hours), parseInt(minutes || 0));
        }
        
        // Create site visit
        const siteVisit = new SiteVisit({
            customerId: customer._id,
            scheduledDate: scheduledDateTime,
            measurements,
            siteNotes: notes ? `Room Type: ${roomType || 'Not specified'}\nCustomer Notes: ${notes}` : `Room Type: ${roomType || 'Not specified'}`,
            status: 'Scheduled'
        });
        
        await siteVisit.save();
        
        const populated = await SiteVisit.findById(siteVisit._id)
            .populate('customerId');
        
        res.status(201).json({
            message: 'Site visit booking request submitted successfully',
            siteVisit: populated
        });
    } catch (error) {
        console.error('Site visit request error:', error);
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// POST create new site visit (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { 
            customerId, 
            scheduledDate, 
            assignedInstaller, 
            measurements,
            siteNotes 
        } = req.body;
        
        if (!customerId) {
            return res.status(400).json({ message: 'Customer is required' });
        }
        
        if (!scheduledDate) {
            return res.status(400).json({ message: 'Scheduled date is required' });
        }
        
        // Verify customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Verify installer exists if provided
        if (assignedInstaller) {
            const installer = await User.findById(assignedInstaller);
            if (!installer) {
                return res.status(404).json({ message: 'Installer not found' });
            }
        }
        
        // Calculate total square feet if dimensions provided
        let calculatedMeasurements = measurements || {};
        if (measurements && measurements.dimensions) {
            const { length, width, unit = 'ft' } = measurements.dimensions;
            let totalSqFt = length * width;
            
            // Convert to square feet if in meters
            if (unit === 'm') {
                totalSqFt = totalSqFt * 10.764; // Convert sq meters to sq feet
            }
            
            calculatedMeasurements.totalSqFt = Math.round(totalSqFt * 100) / 100;
        }
        
        const siteVisit = new SiteVisit({
            customerId,
            scheduledDate: new Date(scheduledDate),
            assignedInstaller,
            measurements: calculatedMeasurements,
            siteNotes,
            status: 'Scheduled'
        });
        
        await siteVisit.save();
        
        const populated = await SiteVisit.findById(siteVisit._id)
            .populate('customerId')
            .populate('assignedInstaller', '-password');
        
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PUT update site visit (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const siteVisit = await SiteVisit.findById(req.params.id);
        if (!siteVisit) {
            return res.status(404).json({ message: 'Site visit not found' });
        }
        
        const { 
            scheduledDate, 
            assignedInstaller, 
            status, 
            measurements, 
            siteNotes 
        } = req.body;
        
        if (scheduledDate !== undefined) siteVisit.scheduledDate = new Date(scheduledDate);
        if (assignedInstaller !== undefined) siteVisit.assignedInstaller = assignedInstaller;
        if (status !== undefined) siteVisit.status = status;
        if (siteNotes !== undefined) siteVisit.siteNotes = siteNotes;
        
        if (measurements) {
            // Recalculate total square feet if dimensions provided
            let updatedMeasurements = measurements;
            if (measurements.dimensions) {
                const { length, width, unit = 'ft' } = measurements.dimensions;
                let totalSqFt = length * width;
                
                if (unit === 'm') {
                    totalSqFt = totalSqFt * 10.764;
                }
                
                updatedMeasurements.totalSqFt = Math.round(totalSqFt * 100) / 100;
            }
            siteVisit.measurements = updatedMeasurements;
        }
        
        await siteVisit.save();
        
        const updated = await SiteVisit.findById(siteVisit._id)
            .populate('customerId')
            .populate('assignedInstaller', '-password');
        
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PATCH update site visit status (admin only)
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const siteVisit = await SiteVisit.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
        .populate('customerId')
        .populate('assignedInstaller', '-password');
        
        if (!siteVisit) {
            return res.status(404).json({ message: 'Site visit not found' });
        }
        
        res.json(siteVisit);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// DELETE site visit (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const siteVisit = await SiteVisit.findByIdAndDelete(req.params.id);
        if (!siteVisit) {
            return res.status(404).json({ message: 'Site visit not found' });
        }
        res.json({ message: 'Site visit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
