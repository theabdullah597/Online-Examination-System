require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedTestUsers = async () => {
  try {
    await connectDB();
    
    // Create or update Admin
    let admin = await User.findOne({ email: 'admin@exam.com' });
    if (!admin) admin = new User({ email: 'admin@exam.com', role: 'Super Admin' });
    admin.fullName = 'Test Admin';
    admin.passwordHash = 'admin123';
    await admin.save();

    // Create or update Teacher
    let teacher = await User.findOne({ email: 'teacher@exam.com' });
    if (!teacher) teacher = new User({ email: 'teacher@exam.com', role: 'Teacher' });
    teacher.fullName = 'Test Teacher';
    teacher.passwordHash = 'teacher123';
    await teacher.save();

    // Create or update Student
    let student = await User.findOne({ email: 'student@exam.com' });
    if (!student) student = new User({ email: 'student@exam.com', role: 'Student' });
    student.fullName = 'Test Student';
    student.passwordHash = 'student123';
    await student.save();

    console.log('Test users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test users:', error);
    process.exit(1);
  }
};

seedTestUsers();
