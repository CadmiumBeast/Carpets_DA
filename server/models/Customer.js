const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: only if customer signed up
    fullName: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    city: String,
    status: { type: String, enum: ['Inquiry', 'Quoted', 'Job Done', 'Active'], default: 'Inquiry' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Sales person/admin assigned
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);