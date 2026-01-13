const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    status: {
        type: String,
        enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Project lead is required']
    },
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    budget: {
        type: Number,
        min: 0,
        default: 0
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
projectSchema.index({ status: 1, deadline: 1 });
projectSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
