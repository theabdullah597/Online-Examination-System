const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

const createTeacher = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const teacher = await User.create({
      fullName,
      email,
      passwordHash: password, // Pre-save hook will hash it
      role: 'Teacher',
      createdBy: req.user._id
    });

    // Send email with credentials
    const emailHtml = `
      <h2>Welcome to Online Examination System</h2>
      <p>Hello ${fullName},</p>
      <p>Your teacher account has been created by the Super Admin.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please login and change your password as soon as possible.</p>
    `;
    
    // Ignore email failure for response, but log it
    sendEmail({ to: email, subject: 'Teacher Account Created', html: emailHtml }).catch(err => console.log('Email failed:', err));

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: { id: teacher._id, fullName: teacher.fullName, email: teacher.email }
    });
  } catch (error) {
    console.error('CREATE_TEACHER_ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTeachersBulk = async (req, res) => {
  try {
    const { teachers } = req.body;
    if (!teachers || !Array.isArray(teachers)) {
      return res.status(400).json({ success: false, message: 'Invalid payload format.' });
    }

    const createdTeachers = [];
    const errors = [];

    for (let i = 0; i < teachers.length; i++) {
      const { fullName, email, password } = teachers[i];
      if (!fullName || !email || !password) {
        errors.push(`Row ${i+1}: Missing required fields.`);
        continue;
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        errors.push(`Row ${i+1}: Email ${email} already exists.`);
        continue;
      }

      try {
        const teacher = await User.create({
          fullName,
          email,
          passwordHash: password,
          role: 'Teacher',
          createdBy: req.user._id
        });
        createdTeachers.push({ id: teacher._id, fullName: teacher.fullName, email: teacher.email });
      } catch (err) {
        errors.push(`Row ${i+1}: Failed to create user. ${err.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully added ${createdTeachers.length} teachers. ${errors.length > 0 ? 'Some rows had errors.' : ''}`,
      data: createdTeachers,
      errors: errors
    });
  } catch (error) {
    console.error('CREATE_TEACHERS_BULK_ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @access  Private/Super Admin
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'Teacher' }).select('-passwordHash');
    res.status(200).json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Super Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ role: 'Teacher' });
    const totalStudents = await User.countDocuments({ role: 'Student' });
    
    // Get monthly registration data for charts (mock logic replaced with dynamic grouping)
    const currentYear = new Date().getFullYear();
    const studentsOverTime = await User.aggregate([
      { $match: { role: 'Student', createdAt: { $gte: new Date(`${currentYear}-01-01`) } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const teachersOverTime = await User.aggregate([
      { $match: { role: 'Teacher', createdAt: { $gte: new Date(`${currentYear}-01-01`) } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let chartData = [];
    for(let i = 1; i <= new Date().getMonth() + 1; i++) {
      let stCount = studentsOverTime.find(s => s._id === i)?.count || 0;
      let teCount = teachersOverTime.find(t => t._id === i)?.count || 0;
      chartData.push({
        name: monthNames[i-1],
        students: stCount,
        teachers: teCount
      });
    }
    
    // If no data, provide a baseline so chart renders nicely
    if (chartData.length === 0) chartData = [{ name: monthNames[new Date().getMonth()], students: 0, teachers: 0 }];

    res.status(200).json({
      success: true,
      data: {
        totalTeachers,
        totalStudents,
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'Teacher' });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTeacher, createTeachersBulk, getTeachers, getDashboardStats, deleteTeacher };
