const express = require('express');
const router = express.Router();
const {
    getAllAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetStats
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats/overview', getAssetStats);
router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.post('/', authorize('admin', 'manager'), createAsset);
router.put('/:id', authorize('admin', 'manager'), updateAsset);
router.delete('/:id', authorize('admin'), deleteAsset);

module.exports = router;
