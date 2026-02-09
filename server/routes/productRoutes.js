const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// GET all products with category details populated (public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create product (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, category, material, description, image, features } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Product name is required' });
        }

        const product = new Product({
            name,
            category,
            material,
            description,
            image,
            features
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PUT update product (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, category, material, description, image, features } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (name !== undefined) product.name = name;
        if (category !== undefined) product.category = category;
        if (material !== undefined) product.material = material;
        if (description !== undefined) product.description = description;
        if (image !== undefined) product.image = image;
        if (features !== undefined) product.features = features;

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// DELETE product (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;