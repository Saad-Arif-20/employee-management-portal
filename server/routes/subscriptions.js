const express = require('express');
const router = express.Router();
const {
    getAllSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscriptionStats
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats/overview', getSubscriptionStats);
router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', authorize('admin', 'manager'), createSubscription);
router.put('/:id', authorize('admin', 'manager'), updateSubscription);
router.delete('/:id', authorize('admin'), deleteSubscription);

module.exports = router;
