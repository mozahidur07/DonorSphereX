const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.userId,
      _id: user._id,       
      email: user.email,
      version: user.jwt_version 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d' 
    }
  );
};


const verifyToken = async (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user by ID
    const user = await User.findOne({ userId: decoded.id });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if token is from before a forced logout
    if (user.jwt_version !== decoded.version) {
      throw new Error('Token expired due to security logout');
    }
    
    return user;
  } catch (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }
};


const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         '0.0.0.0';
};


const updateLoginHistory = async (user, ip) => {
  const isNewIP = user.addLoginIP(ip);
  await user.save();
  return isNewIP;
};

module.exports = {
  generateToken,
  verifyToken,
  getClientIP,
  updateLoginHistory
};
