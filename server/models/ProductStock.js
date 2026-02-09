const mongoose = require('mongoose');

const ProductStockSchema = new mongoose.Schema({
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    rollNumber: String,
    dimensions: {
        width: Number,
        length: Number
    },
    colour: String,
    location: String, // e.g., "Warehouse A - Shelf 3"
    status: { type: String, enum: ['Available', 'Reserved', 'Sold'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('ProductStock', ProductStockSchema);