const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');
const SecurityLog = require('../models/SecurityLog');

const getMyExams = async (req, res) => {
  try {
    // Find exams for the student's class
    const exams = await Exam.find({ classId: req.user.classId, status: { $in: ['scheduled', 'active'] } });
    
    // Find attempts that are already submitted
    const attempts = await Attempt.find({ 
      studentId: req.user._id, 
      status: { $in: ['submitted', 'auto_submitted'] } 
    }).select('examId');
    
    const submittedExamIds = attempts.map(a => a.examId.toString());
    
    // Filter out submitted exams
    const pendingExams = exams.filter(exam => !submittedExamIds.includes(exam._id.toString()));
    
    res.status(200).json({ success: true, count: pendingExams.length, data: pendingExams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const startExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId).populate('questions');
    
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.status !== 'active') return res.status(400).json({ success: false, message: 'Exam is not active right now' });

    // Check if attempt already exists
    let attempt = await Attempt.findOne({ studentId: req.user._id, examId });
    if (!attempt) {
      attempt = await Attempt.create({
        studentId: req.user._id,
        examId,
        startTime: new Date()
      });
    } else if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Exam already submitted' });
    }

    // Strip out correct answers before sending to student
    const sanitizedQuestions = exam.questions.map(q => ({
      _id: q._id,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks
    }));

    res.status(200).json({
      success: true,
      data: { attemptId: attempt._id, exam: { ...exam._doc, questions: sanitizedQuestions }, startTime: attempt.startTime }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    
    const attempt = await Attempt.findOne({ _id: attemptId, studentId: req.user._id });
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.status !== 'in_progress') return res.status(400).json({ success: false, message: 'Exam already submitted' });

    attempt.answers = answers;
    await attempt.save();
    
    res.status(200).json({ success: true, message: 'Answers saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitExam = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, autoSubmitted } = req.body;

    const attempt = await Attempt.findOne({ _id: attemptId, studentId: req.user._id });
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.status !== 'in_progress') return res.status(400).json({ success: false, message: 'Exam already submitted' });

    attempt.answers = answers || attempt.answers;
    attempt.status = autoSubmitted ? 'auto_submitted' : 'submitted';
    attempt.endTime = new Date();
    
    // Auto-grading logic
    const exam = await Exam.findById(attempt.examId).populate('questions');
    let totalScore = 0;
    let fullyGraded = true;

    attempt.answers.forEach(ans => {
      const question = exam.questions.find(q => q._id.toString() === ans.questionId.toString());
      if (question) {
        if (['MCQ', 'True/False', 'Fill in the Blank'].includes(question.type)) {
          const isCorrect = String(ans.studentAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
          if (isCorrect) {
            ans.marksObtained = question.marks;
            totalScore += question.marks;
          } else {
            ans.marksObtained = 0;
          }
          ans.gradedManually = false;
        } else {
          ans.marksObtained = 0;
          ans.gradedManually = true; // Requires manual grading
          fullyGraded = false;
        }
      }
    });
    
    attempt.score = totalScore;
    attempt.isFullyGraded = fullyGraded;
    await attempt.save();
    res.status(200).json({ success: true, message: 'Exam submitted successfully', score: totalScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logSecurityViolation = async (req, res) => {
  try {
    const { attemptId, examId, violationType, details } = req.body;
    
    await SecurityLog.create({
      studentId: req.user._id,
      examId,
      attemptId,
      violationType,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyResults = async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.user._id, status: { $in: ['submitted', 'auto_submitted'] } })
      .populate('examId', 'title totalMarks passingMarks')
      .sort({ endTime: -1 });
    
    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyExams, startExam, saveAnswers, submitExam, logSecurityViolation, getMyResults };
