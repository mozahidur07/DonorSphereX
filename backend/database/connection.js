const mongoose = require('mongoose');

// Connect to MongoDB database with retry logic
const connectDB = async (retryCount = 5, delay = 5000) => {
  let currentRetry = 0;
  
  const attemptConnection = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI;
      
      if (!mongoURI) {
        console.error('MongoDB connection string not found in environment variables');
        process.exit(1);
      }
      
      console.log(`Attempting to connect to MongoDB (Attempt ${currentRetry + 1}/${retryCount})...`);
      
      const conn = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
        heartbeatFrequencyMS: 30000, // Heartbeat every 30 seconds
      });
      
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      
      if (currentRetry < retryCount) {
        currentRetry++;
        console.log(`Retrying in ${delay / 1000} seconds...`);
        
        return new Promise(resolve => {
          setTimeout(() => resolve(attemptConnection()), delay);
        });
      }
      
      console.error(`Failed to connect after ${retryCount} attempts`);
      process.exit(1);
    }
  };
  
  return attemptConnection();
};

module.exports = connectDB;
