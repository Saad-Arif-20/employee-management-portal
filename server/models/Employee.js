const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['Engineering', 'Design', 'Product', 'Marketing', 'HR', 'Sales', 'Finance', 'Operations']
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required'],
        min: 0
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required']
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active'
    },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    lastWorkingDate: {
        type: Date,
        default: null
    },
    leaveStartDate: {
        type: Date,
        default: null
    },
    leaveEndDate: {
        type: Date,
        default: null
    },
    totalLeaveDays: {
        type: Number,
        default: 0,
        min: 0
    },
    paidLeaveDays: {
        type: Number,
        default: 0,
        min: 0
    },
    unpaidLeaveDays: {
        type: Number,
        default: 0,
        min: 0
    },
    profileImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ name: 'text', email: 'text' });

// Virtual for reportees
employeeSchema.virtual('reportees', {
    ref: 'Employee',
    localField: '_id',
    foreignField: 'reportingTo'
});

module.exports = mongoose.model('Employee', employeeSchema);
