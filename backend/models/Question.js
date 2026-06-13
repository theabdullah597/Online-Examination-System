const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['MCQ', 'True/False', 'Fill in the Blank', 'Short Answer', 'Essay'], 
    required: true 
  },
  questionText: { type: String, required: true },
  options: [{ type: String }], // for MCQ
  correctAnswer: { type: mongoose.Schema.Types.Mixed }, // String, Boolean, or Array depending on type
  marks: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  topic: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
