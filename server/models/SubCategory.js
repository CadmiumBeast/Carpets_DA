const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    image: String,
    description: String
}, { timestamps: true });

module.exports = mongoose.model('SubCategory', SubCategorySchema);
