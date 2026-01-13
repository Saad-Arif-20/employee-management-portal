const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Subscription type is required'],
        enum: ['Software', 'Infrastructure', 'Services', 'Security', 'Other']
    },
    price: {
        type: String,
        required: [true, 'Price is required']
    },
    priceAmount: {
        type: Number,
        required: [true, 'Price amount is required'],
        min: 0
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly', 'one-time'],
        default: 'monthly'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    renewalDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Cancelled'],
        default: 'Active'
    },
    assignedTo: [{
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        status: {
            type: String,
            enum: ['Active', 'Paused', 'Cancelled'],
            default: 'Active'
        },
        startDate: {
            type: Date,
            default: Date.now
        }
    }],
    selectedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    vendor: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
subscriptionSchema.index({ type: 1, status: 1 });
subscriptionSchema.index({ name: 'text' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
