const express = require('express');
const { createTeacher, getTeachers, getDashboardStats, deleteTeacher } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Super Admin'));

router.get('/dashboard-stats', getDashboardStats);

router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.post('/teachers/bulk', require('../controllers/adminController').createTeachersBulk);
router.delete('/teachers/:id', deleteTeacher);

module.exports = router;
