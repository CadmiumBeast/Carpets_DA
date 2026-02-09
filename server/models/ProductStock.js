const mongoose = require('mongoose');

const ProductStockSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    rollNumber: String,
    dimensions: {
        width: Number,
        length: Number
    },
    warehouseLocation: String,
    status: { type: String, enum: ['Available', 'Reserved', 'Sold'], default: 'Available' }
});