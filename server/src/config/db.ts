import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/praveen_portfolio';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    const err = error as Error;
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
