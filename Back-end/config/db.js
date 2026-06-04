import mongoose from 'mongoose';
import User from '../models/User.model.js';

export let isMockDB = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-ai', {
      serverSelectionTimeoutMS: 2000 // Fast fail in 2 seconds if MongoDB is not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin user in real MongoDB
    const adminExists = await User.findOne({ email: 'kalemahesh082003@gmail.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'kalemahesh082003@gmail.com',
        password: 'Kale@9699', // Will be hashed automatically by user Schema save pre-hook
        role: 'admin',
      });
      console.log('Seed: Default admin user seeded successfully (kalemahesh082003@gmail.com)');
    }
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    console.log('------------------------------------------------------------');
    console.log('🚀 Running in In-Memory Mock Database mode!');
    console.log('   Data will be saved in memory and will not persist across restarts.');
    console.log('   Configure MONGO_URI in Back-end/.env to use a real database.');
    console.log('------------------------------------------------------------');
    isMockDB = true;
  }
};

export default connectDB;
