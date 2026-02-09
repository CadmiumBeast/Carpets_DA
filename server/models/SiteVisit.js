const mongoose = require('mongoose');

const SiteVisitSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    scheduledDate: { type: Date, required: true },
    assignedInstaller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
        type: String, 
        enum: ['Scheduled', 'Completed', 'Cancelled'], 
        default: 'Scheduled' 
    },
    measurements: {
        roomName: String, // e.g., "Living Room"
        dimensions: {
            length: Number,
            width: Number,
            unit: { type: String, default: 'ft' }
        },
        totalSqFt: Number
    },
    siteNotes: String
}, { timestamps: true });

module.exports = mongoose.model('SiteVisit', SiteVisitSchema);