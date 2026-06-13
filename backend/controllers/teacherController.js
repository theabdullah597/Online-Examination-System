const User = require('../models/User');
const Class = require('../models/Class');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');
const SecurityLog = require('../models/SecurityLog');
const { sendEmail } = require('../services/emailService');

// --- CLASSES ---
const createClass = async (req, res) => {
  try {
    const { className, description } = req.body;
    const newClass = await Class.create({
      className,
      description,
      teacherId: req.user._id
    });
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id }).populate('students', 'fullName email rollNumber');
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- STUDENTS ---
const createStudent = async (req, res) => {
  try {
    const { fullName, email, password, rollNumber, classId } = req.body;
    
    // Check if class belongs to teacher
    const classExists = await Class.findOne({ _id: classId, teacherId: req.user._id });
    if (!classExists) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Student email already exists' });
    }

    const student = await User.create({
      fullName,
      email,
      passwordHash: password,
      role: 'Student',
      rollNumber,
      classId,
      createdBy: req.user._id
    });

    // Add student to class
    classExists.students.push(student._id);
    await classExists.save();

    // Send credentials via email
    const emailHtml = `
      <h2>Welcome to Online Examination System</h2>
      <p>Hello ${fullName},</p>
      <p>Your student account has been created.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please login to access your exams.</p>
    `;
    sendEmail({ to: email, subject: 'Student Account Created', html: emailHtml }).catch(err => console.log('Email failed:', err));

    res.status(201).json({ success: true, data: { id: student._id, fullName: student.fullName, email: student.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStudentsBulk = async (req, res) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, message: 'Invalid payload format.' });
    }

    const createdStudents = [];
    const errors = [];

    // Group students by classId to verify the classes and update them later
    const classesToUpdate = new Set();
    const studentsToAdd = [];

    for (let i = 0; i < students.length; i++) {
      const { fullName, email, password, rollNumber, classId } = students[i];
      
      if (!fullName || !email || !password || !classId) {
        errors.push(`Row ${i+1}: Missing required fields.`);
        continue;
      }

      const classExists = await Class.findOne({ _id: classId, teacherId: req.user._id });
      if (!classExists) {
        errors.push(`Row ${i+1}: Class not found or not owned by you.`);
        continue;
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        errors.push(`Row ${i+1}: Email ${email} already exists.`);
        continue;
      }

      try {
        const student = await User.create({
          fullName,
          email,
          passwordHash: password,
          role: 'Student',
          rollNumber,
          classId,
          createdBy: req.user._id
        });
        
        // Push student to class
        classExists.students.push(student._id);
        await classExists.save();

        createdStudents.push({ id: student._id, fullName: student.fullName, email: student.email });
      } catch (err) {
        errors.push(`Row ${i+1}: Failed to create user. ${err.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully added ${createdStudents.length} students. ${errors.length > 0 ? 'Some rows had errors.' : ''}`,
      data: createdStudents,
      errors: errors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'Student', createdBy: req.user._id }).populate('classId', 'className');
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- QUESTION BANK ---
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.user._id });
    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- EXAMS ---
const createExam = async (req, res) => {
  try {
    const { startDate, endDate, durationMinutes } = req.body;
    
    // Exam duration validation
    if (startDate && endDate && durationMinutes) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const durationMs = durationMinutes * 60000;
      
      if (end - start < durationMs) {
        return res.status(400).json({ 
          success: false, 
          message: `Exam window (Start to End) must be at least as long as the duration (${durationMinutes} minutes).` 
        });
      }
    }

    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id }).populate('classId', 'className');
    res.status(200).json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student', createdBy: req.user._id });
    const activeExams = await Exam.countDocuments({ createdBy: req.user._id, status: { $in: ['scheduled', 'active'] } });
    
    // Find all exams created by this teacher
    const myExams = await Exam.find({ createdBy: req.user._id }).select('_id totalMarks passingMarks');
    const myExamIds = myExams.map(e => e._id);
    
    // Find all submitted attempts for these exams
    const attempts = await Attempt.find({ examId: { $in: myExamIds }, status: { $in: ['submitted', 'auto_submitted'] } }).populate('examId', 'totalMarks passingMarks');
    
    let totalAchievedMarks = 0;
    let totalMaxPossibleMarks = 0;
    let passedCount = 0;
    
    attempts.forEach(attempt => {
      const totalMarks = attempt.examId?.totalMarks || 100;
      const passingMarks = attempt.examId?.passingMarks || (totalMarks * 0.5);
      
      totalAchievedMarks += attempt.score;
      totalMaxPossibleMarks += totalMarks;
      
      if (attempt.score >= passingMarks) {
        passedCount++;
      }
    });

    const avgScore = totalMaxPossibleMarks > 0 ? Math.round((totalAchievedMarks / totalMaxPossibleMarks) * 100) : 0;
    const passRate = attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeExams,
        avgScore,
        passRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find()
      .populate('studentId', 'fullName email rollNumber')
      .populate('examId', 'title')
      .sort({ timestamp: -1 });
    
    // Filter logs for exams created by this teacher
    const myExams = await Exam.find({ createdBy: req.user._id }).select('_id');
    const myExamIds = myExams.map(e => e._id.toString());
    
    const filteredLogs = logs.filter(log => log.examId && myExamIds.includes(log.examId._id.toString()));

    res.status(200).json({ success: true, count: filteredLogs.length, data: filteredLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ATTEMPTS & GRADING ---
const getAttempts = async (req, res) => {
  try {
    const myExams = await Exam.find({ createdBy: req.user._id }).select('_id');
    const myExamIds = myExams.map(e => e._id);
    
    const attempts = await Attempt.find({ examId: { $in: myExamIds }, status: { $in: ['submitted', 'auto_submitted'] } })
      .populate('studentId', 'fullName email rollNumber')
      .populate('examId', 'title')
      .sort({ endTime: -1 });

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('studentId', 'fullName email rollNumber')
      .populate('examId', 'title totalMarks passingMarks')
      .populate('answers.questionId', 'questionText type marks options correctAnswer');
      
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    
    // Verify teacher owns the exam
    const exam = await Exam.findOne({ _id: attempt.examId._id, createdBy: req.user._id });
    if (!exam) return res.status(403).json({ success: false, message: 'Not authorized to view this attempt' });

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const gradeAttempt = async (req, res) => {
  try {
    const { grades } = req.body; // Array of { questionId, marksObtained }
    const attempt = await Attempt.findById(req.params.id);
    
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    const exam = await Exam.findOne({ _id: attempt.examId, createdBy: req.user._id });
    if (!exam) return res.status(403).json({ success: false, message: 'Not authorized to grade this attempt' });

    let updatedScore = 0;

    attempt.answers.forEach(ans => {
      const manualGrade = grades.find(g => g.questionId === ans.questionId.toString());
      if (manualGrade !== undefined) {
        ans.marksObtained = manualGrade.marksObtained;
        ans.gradedManually = true;
      }
      updatedScore += ans.marksObtained;
    });

    attempt.score = updatedScore;
    attempt.isFullyGraded = true;
    await attempt.save();

    res.status(200).json({ success: true, message: 'Grades updated successfully', score: attempt.score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    
    // Verify teacher owns the exam
    const exam = await Exam.findOne({ _id: attempt.examId, createdBy: req.user._id });
    if (!exam) return res.status(403).json({ success: false, message: 'Not authorized to delete this attempt' });

    await Attempt.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Attempt deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'Student', createdBy: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found or not authorized' });
    
    if (student.classId) {
      await Class.updateOne({ _id: student.classId }, { $pull: { students: student._id } });
    }
    
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!classObj) return res.status(404).json({ success: false, message: 'Class not found or not authorized' });
    
    await User.updateMany({ classId: req.params.id }, { $set: { classId: null } });
    
    await Class.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createClass, getClasses, deleteClass,
  createStudent, createStudentsBulk, getStudents, deleteStudent,
  createQuestion, getQuestions,
  createExam, getExams,
  getDashboardStats,
  getSecurityLogs,
  getAttempts, getAttemptById, gradeAttempt, deleteAttempt
};
