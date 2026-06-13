require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/Online-Examination-System').then(async () => {
  try {
    const user = await User.create({
      fullName: 'Test2',
      email: 'test2@test.com',
      passwordHash: 'Pass',
      role: 'Teacher'
    });
    console.log('Success!', user);
  } catch (error) {
    console.error('Error in create:', error.message);
    console.error(error.stack);
  } finally {
    mongoose.disconnect();
  }
});
