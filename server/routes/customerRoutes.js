const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// GET all customers (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const customers = await Customer.find(filter)
            .populate('assignedTo', 'fullName email')
            .sort({ createdAt: -1 });
        
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET single customer (admin only)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('assignedTo', 'fullName email');
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create new customer (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { fullName, phone, email, address, city, status, assignedTo } = req.body;
        
        if (!fullName) {
            return res.status(400).json({ message: 'Full name is required' });
        }
        
        // Check if customer with email already exists
        if (email) {
            const existing = await Customer.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ message: 'Customer with this email already exists' });
            }
        }
        
        const customer = new Customer({
            fullName,
            phone,
            email: email ? email.toLowerCase() : undefined,
            address,
            city,
            status: status || 'Inquiry',
            assignedTo
        });
        
        await customer.save();
        
        const populated = await Customer.findById(customer._id)
            .populate('assignedTo', 'fullName email');
        
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// PUT update customer (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { fullName, phone, email, address, city, status, assignedTo } = req.body;
        
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Check if email is being changed and if new email is already in use
        if (email && email.toLowerCase() !== customer.email) {
            const existing = await Customer.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ message: 'Customer with this email already exists' });
            }
        }
        
        customer.fullName = fullName || customer.fullName;
        customer.phone = phone !== undefined ? phone : customer.phone;
        customer.email = email ? email.toLowerCase() : customer.email;
        customer.address = address !== undefined ? address : customer.address;
        customer.city = city !== undefined ? city : customer.city;
        customer.status = status || customer.status;
        customer.assignedTo = assignedTo !== undefined ? assignedTo : customer.assignedTo;
        
        await customer.save();
        
        const updated = await Customer.findById(customer._id)
            .populate('assignedTo', 'fullName email');
        
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
});

// DELETE customer (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
