const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    
    // Site visit details
    siteVisit: {
        scheduledDate: Date,
        completedDate: Date,
        roomName: String, // e.g., "Living Room"
        notes: String
    },
    
    // Measurements
    measurements: {
        dimensions: {
            length: Number,
            width: Number,
            unit: { type: String, default: 'ft' }
        },
        totalSqFt: Number
    },
    
    // Quotation items (multiple subcategories can be quoted)
    items: [{
        subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: Number, // Price at time of quotation
        totalPrice: Number
    }],
    
    // Totals
    subtotal: Number,
    tax: Number,
    totalAmount: Number,
    
    // Quotation status
    status: { 
        type: String, 
        enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'], 
        default: 'Draft' 
    },
    
    quotationDate: { type: Date, default: Date.now },
    validUntil: Date,
    
    // Assignment
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    internalNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);