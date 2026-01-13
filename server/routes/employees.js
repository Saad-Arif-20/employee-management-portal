const express = require('express');
const router = express.Router();
const {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats/overview', getEmployeeStats);
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('admin', 'manager'), createEmployee);
router.put('/:id', authorize('admin', 'manager'), updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;
