const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getAllProjects = async (req, res) => {
    try {
        const { status, search } = req.query;

        let query = {};

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const projects = await Project.find(query)
            .populate('lead', 'name employeeId email')
            .populate('team', 'name employeeId email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message
        });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('lead', 'name employeeId email role')
            .populate('team', 'name employeeId email role');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project',
            error: error.message
        });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin/Manager)
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating project',
            error: error.message
        });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin/Manager)
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating project',
            error: error.message
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting project',
            error: error.message
        });
    }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/overview
// @access  Private
exports.getProjectStats = async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        const activeProjects = await Project.countDocuments({ status: 'In Progress' });
        const completedProjects = await Project.countDocuments({ status: 'Completed' });

        const statusStats = await Project.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalProjects,
                activeProjects,
                completedProjects,
                statusStats
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
