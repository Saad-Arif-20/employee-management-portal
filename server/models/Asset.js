const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    assetId: {
        type: String,
        required: [true, 'Asset ID is required'],
        unique: true,
        trim: true
    },
    assetTag: {
        type: String,
        required: [true, 'Asset tag is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Asset name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Asset type is required'],
        enum: ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Accessory', 'Other']
    },
    status: {
        type: String,
        enum: ['Available', 'Assigned', 'In Repair', 'Retired'],
        default: 'Available'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    purchaseDate: {
        type: Date,
        required: [true, 'Purchase date is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    serialNumber: {
        type: String,
        trim: true,
        default: null
    },
    warranty: {
        expiryDate: Date,
        provider: String
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
assetSchema.index({ status: 1, type: 1 });
assetSchema.index({ name: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
