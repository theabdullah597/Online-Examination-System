const express = require('express');
const { getMyExams, startExam, saveAnswers, submitExam, logSecurityViolation, getMyResults } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Student'));

router.get('/exams', getMyExams);
router.get('/results', getMyResults);
router.get('/exams/:examId/start', startExam);
router.put('/attempts/:attemptId/save', saveAnswers);
router.post('/attempts/:attemptId/submit', submitExam);
router.post('/security-log', logSecurityViolation);

module.exports = router;
