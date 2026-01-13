const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getAllEmployees = async (req, res) => {
    try {
        const { department, status, search } = req.query;

        // AUTOMATIC LEAVE STATUS CHECK
        // Whenever employees are fetched, update their statuses based on dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Activate Leave: If today matches or passes Leave Start Date, set status to 'On Leave'
        await Employee.updateMany(
            {
                status: 'Active',
                leaveStartDate: { $lte: today },
                leaveEndDate: { $gte: today }
            },
            { $set: { status: 'On Leave' } }
        );

        // 2. End Leave: If today is after Leave End Date, set status to 'Active'
        // We do NOT clear the leave fields so that the Dashboard can still calculate 
        // past salary deductions correctly based on the dates.
        await Employee.updateMany(
            {
                status: 'On Leave',
                leaveEndDate: { $lt: today }
            },
            {
                $set: {
                    status: 'Active'
                }
            }
        );

        // Proceed with query
        let query = {};

        if (department) query.department = department;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        const employees = await Employee.find(query)
            .populate('reportingTo', 'name employeeId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('reportingTo', 'name employeeId role');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/Manager)
exports.createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID or Email already exists'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/Manager)
exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats/overview
// @access  Private
exports.getEmployeeStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: 'Active' });
        const onLeave = await Employee.countDocuments({ status: 'On Leave' });

        const departmentStats = await Employee.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                activeEmployees,
                onLeave,
                departmentStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};
