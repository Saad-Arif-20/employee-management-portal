const express = require('express');
const router = express.Router();
const {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats/overview', getProjectStats);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('admin', 'manager'), createProject);
router.put('/:id', authorize('admin', 'manager'), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

module.exports = router;
