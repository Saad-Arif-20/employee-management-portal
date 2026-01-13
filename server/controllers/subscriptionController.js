const Subscription = require('../models/Subscription');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private
exports.getAllSubscriptions = async (req, res) => {
    try {
        const { type, status, search } = req.query;

        let query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { vendor: { $regex: search, $options: 'i' } }
            ];
        }

        const subscriptions = await Subscription.find(query)
            .populate('assignedTo.employee', 'name employeeId email')
            .populate('selectedProjects', 'title status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriptions',
            error: error.message
        });
    }
};

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
exports.getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('assignedTo.employee', 'name employeeId email role')
            .populate('selectedProjects', 'title status deadline');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription',
            error: error.message
        });
    }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private (Admin/Manager)
exports.createSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating subscription',
            error: error.message
        });
    }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private (Admin/Manager)
exports.updateSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            data: subscription
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating subscription',
            error: error.message
        });
    }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private (Admin)
exports.deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting subscription',
            error: error.message
        });
    }
};

// @desc    Get subscription statistics
// @route   GET /api/subscriptions/stats/overview
// @access  Private
exports.getSubscriptionStats = async (req, res) => {
    try {
        const totalSubscriptions = await Subscription.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'Active' });

        const typeStats = await Subscription.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyCost = await Subscription.aggregate([
            {
                $match: { status: 'Active', billingCycle: 'monthly' }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$priceAmount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalSubscriptions,
                activeSubscriptions,
                typeStats,
                monthlyCost: monthlyCost[0]?.total || 0
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
