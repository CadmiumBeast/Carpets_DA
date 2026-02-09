const express = require('express');
const router = express.Router();
const ProductStock = require('../models/ProductStock');

// GET all stock items (with Product details)
router.get('/', async (req, res) => {
    try {
        const stock = await ProductStock.find().populate('productId');
        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new stock entry (e.g., a new roll arrived)
router.post('/', async (req, res) => {
    try {
        const newStock = new ProductStock(req.body);
        await newStock.save();
        res.status(201).json(newStock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH update stock status (e.g., Reserved for a customer)
router.patch('/:id/status', async (req, res) => {
    try {
        const updatedStock = await ProductStock.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true }
        );
        res.json(updatedStock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;