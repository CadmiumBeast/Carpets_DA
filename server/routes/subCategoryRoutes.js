const express = require('express');
const router = express.Router();
const SubCategory = require('../models/SubCategory');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// GET all subcategories with category details populated (public)
router.get('/', async (req, res) => {
    try {
        const subcategories = await SubCategory.find().populate('category');
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET single subcategory (public)
router.get('/:id', async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id).populate('category');
        if (!subcategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }
        res.json(subcategory);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create subcategory (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, category, price, image, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'SubCategory name is required' });
        }

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        if (!price) {
            return res.status(400).json({ message: 'Price is required' });
        }

        const subcategory = new SubCategory({
            name,
            category,
            price,
            image,
            description
        });

        await subcategory.save();
        res.status(201).json(subcategory);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PUT update subcategory (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, category, price, image, description } = req.body;
        const subcategory = await SubCategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        if (name !== undefined) subcategory.name = name;
        if (category !== undefined) subcategory.category = category;
        if (price !== undefined) subcategory.price = price;
        if (image !== undefined) subcategory.image = image;
        if (description !== undefined) subcategory.description = description;

        await subcategory.save();
        res.json(subcategory);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// DELETE subcategory (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const subcategory = await SubCategory.findByIdAndDelete(req.params.id);
        if (!subcategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }
        res.json({ message: 'SubCategory deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
