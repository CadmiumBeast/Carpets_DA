const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    material: String,
    basePrice: Number, // Price per sq ft or meter
    features: [String] // e.g., ["Waterproof", "High Pile"]
});