const Asset = require('../models/Asset');

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
exports.getAllAssets = async (req, res) => {
    try {
        const { type, status, search } = req.query;

        let query = {};

        if (type) query.type = type;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { assetId: { $regex: search, $options: 'i' } },
                { assetTag: { $regex: search, $options: 'i' } }
            ];
        }

        const assets = await Asset.find(query)
            .populate('assignedTo', 'name employeeId email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: assets.length,
            data: assets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching assets',
            error: error.message
        });
    }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
exports.getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id)
            .populate('assignedTo', 'name employeeId email role');

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        res.status(200).json({
            success: true,
            data: asset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching asset',
            error: error.message
        });
    }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private (Admin/Manager)
exports.createAsset = async (req, res) => {
    try {
        const asset = await Asset.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Asset created successfully',
            data: asset
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Asset ID or Asset Tag already exists'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error creating asset',
            error: error.message
        });
    }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin/Manager)
exports.updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Asset updated successfully',
            data: asset
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating asset',
            error: error.message
        });
    }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
exports.deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Asset deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting asset',
            error: error.message
        });
    }
};

// @desc    Get asset statistics
// @route   GET /api/assets/stats/overview
// @access  Private
exports.getAssetStats = async (req, res) => {
    try {
        const totalAssets = await Asset.countDocuments();
        const assignedAssets = await Asset.countDocuments({ status: 'Assigned' });
        const availableAssets = await Asset.countDocuments({ status: 'Available' });

        const typeStats = await Asset.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price' }
                }
            }
        ]);

        const totalValue = await Asset.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalAssets,
                assignedAssets,
                availableAssets,
                typeStats,
                totalValue: totalValue[0]?.total || 0
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
