import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartspend';
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Make sure MONGO_URI is configured in backend/.env or MongoDB is running locally.');
    process.exit(1);
  }
};

export default connectDatabase;
