const express = require('express');
const router = express.Router();
const ProductStock = require('../models/ProductStock');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// GET all stock items (with SubCategory details) (public)
router.get('/', async (req, res) => {
    try {
        const { status, subCategoryId, location } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (subCategoryId) filter.subCategoryId = subCategoryId;
        if (location) filter.location = new RegExp(location, 'i');
        
        const stock = await ProductStock.find(filter)
            .populate({
                path: 'subCategoryId',
                populate: { path: 'category' }
            })
            .sort({ createdAt: -1 });
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET single stock item (public)
router.get('/:id', async (req, res) => {
    try {
        const stock = await ProductStock.findById(req.params.id).populate('subCategoryId');
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST new stock entry (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { subCategoryId, rollNumber, dimensions, colour, location, status } = req.body;

        if (!subCategoryId) {
            return res.status(400).json({ message: 'SubCategory is required' });
        }

        const newStock = new ProductStock({
            subCategoryId,
            rollNumber,
            dimensions,
            colour,
            location,
            status
        });

        await newStock.save();
        res.status(201).json(newStock);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PUT update stock item (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { subCategoryId, rollNumber, dimensions, colour, location, status } = req.body;
        const stock = await ProductStock.findById(req.params.id);

        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }

        if (subCategoryId !== undefined) stock.subCategoryId = subCategoryId;
        if (rollNumber !== undefined) stock.rollNumber = rollNumber;
        if (dimensions !== undefined) stock.dimensions = dimensions;
        if (colour !== undefined) stock.colour = colour;
        if (location !== undefined) stock.location = location;
        if (status !== undefined) stock.status = status;

        await stock.save();
        res.json(stock);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PATCH update stock status (admin only)
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
    try {
        const updatedStock = await ProductStock.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!updatedStock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }
        res.json(updatedStock);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// GET stock analytics/statistics (admin only)
router.get('/analytics/summary', authMiddleware, adminOnly, async (req, res) => {
    try {
        const analytics = await ProductStock.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalArea: { 
                        $sum: { 
                            $multiply: ['$dimensions.width', '$dimensions.length'] 
                        } 
                    }
                }
            }
        ]);
        
        const bySubCategory = await ProductStock.aggregate([
            {
                $group: {
                    _id: '$subCategoryId',
                    count: { $sum: 1 },
                    available: {
                        $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'subCategory'
                }
            },
            { $unwind: '$subCategory' }
        ]);
        
        res.json({ byStatus: analytics, bySubCategory });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE stock item (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const stock = await ProductStock.findByIdAndDelete(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }
        res.json({ message: 'Stock item deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;