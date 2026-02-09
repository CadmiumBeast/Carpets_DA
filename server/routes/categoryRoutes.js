const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET all categories
router.get('/', async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
});

// POST a new category
router.post('/', async (req, res) => {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
});

module.exports = router;