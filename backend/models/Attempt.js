const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'submitted', 'auto_submitted'], default: 'in_progress' },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    studentAnswer: { type: mongoose.Schema.Types.Mixed }, // Can be string, number, array depending on question type
    marksObtained: { type: Number, default: 0 },
    gradedManually: { type: Boolean, default: false }
  }],
  isFullyGraded: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
