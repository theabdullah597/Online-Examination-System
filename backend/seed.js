require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedSuperAdmin = async () => {
  try {
    await connectDB();
    
    // Check if Super Admin exists
    const existingAdmin = await User.findOne({ role: 'Super Admin' });
    if (existingAdmin) {
      console.log('Super Admin already exists.');
      process.exit(0);
    }

    // Create Super Admin
    const superAdmin = new User({
      fullName: 'Super Admin',
      email: 'admin@example.com',
      passwordHash: 'Admin@123', // Will be hashed by pre-save hook
      role: 'Super Admin',
      status: 'active'
    });

    await superAdmin.save();
    console.log('Super Admin created successfully:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
