const express = require('express');
const { 
  createClass, getClasses, deleteClass,
  createStudent, getStudents, deleteStudent,
  createQuestion, getQuestions,
  createExam, getExams,
  getDashboardStats,
  getSecurityLogs,
  getAttempts, getAttemptById, gradeAttempt, deleteAttempt
} = require('../controllers/teacherController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Teacher'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/security-logs', getSecurityLogs);

router.route('/classes')
  .get(getClasses)
  .post(createClass);

router.delete('/classes/:id', deleteClass);

router.route('/students')
  .get(getStudents)
  .post(createStudent);

router.post('/students/bulk', require('../controllers/teacherController').createStudentsBulk);
router.delete('/students/:id', deleteStudent);

router.route('/questions')
  .get(getQuestions)
  .post(createQuestion);

router.route('/exams')
  .get(getExams)
  .post(createExam);

router.get('/attempts', getAttempts);
router.get('/attempts/:id', getAttemptById);
router.put('/attempts/:id/grade', gradeAttempt);
router.delete('/attempts/:id', deleteAttempt);

module.exports = router;
