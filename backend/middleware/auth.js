const { verifyToken } = require('../controllers/auth/authUtils');
 
const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      const user = await verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed: ' + error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error during authentication'
    });
  }
};

 
const authorize = (roleType) => {
  return (req, res, next) => {
    if (!req.user.role[roleType]) {

      return res.status(403).json({
        status: 'error',
        message: `Unauthorized: ${roleType} role required`
      });
    }
    
    if (roleType === 'staff' && !req.user.staff_approval) {
      return res.status(403).json({
        status: 'error',
        message: 'Your staff account is pending approval'
      });
    }
    
    next();
  };
};

 
const restrictTo = (...roles) => {
  return (req, res, next) => {
    
    const hasRequiredRole = roles.some(role => req.user.role[role]);
    
    if (!hasRequiredRole) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    
    if (roles.includes('staff') && req.user.role.staff && !req.user.staff_approval) {
      return res.status(403).json({
        status: 'error',
        message: 'Your staff account is pending approval'
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize,
  restrictTo
};
