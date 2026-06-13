const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
  violationType: { 
    type: String, 
    enum: ['tab_switch', 'exit_fullscreen', 'dev_tools', 'multiple_login', 'shortcut_used', 'copy_paste', 'other'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
  duration: { type: Number }, // Duration of violation if applicable (e.g., how long tab was inactive)
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
