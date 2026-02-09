const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    address: String,
    status: { type: String, default: 'Inquiry' }, // Inquiry, Quoted, Job Done
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });