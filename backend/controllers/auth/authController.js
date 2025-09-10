const User = require('../../models/User');
const { 
  generateToken, 
  getClientIP, 
  updateLoginHistory 
} = require('./authUtils');


const register = async (req, res) => {
  try {
    const { name, fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    // Create roles object
    const userRoles = {
      donor: false,
      staff: false,
      admin: false
    };


    if (typeof role === 'string') {
     
      if (['donor', 'staff', 'admin'].includes(role)) {
        userRoles[role] = true;
      }
    } else if (typeof role === 'object') {
      
      Object.keys(role).forEach(key => {
        if (['donor', 'staff', 'admin'].includes(key)) {
          userRoles[key] = Boolean(role[key]);
        }
      });
    }


    const staff_approval = userRoles.staff ? false : undefined;


    const currentTime = new Date();
    const ProfileReminderTime = new Date(currentTime.getTime() + 2000);
    
    const initialNotifications = [
      {
        message: "Account created successfully! Welcome to our platform.",
        time: currentTime,
        from: "System",
        isRead: false,
        type: "success"
      },
      {
        message: "Please complete your profile with blood type information",
        time: ProfileReminderTime, 
        from: "System",
        isRead: false,
        type: "reminder"
      }
    ];


    const user = await User.create({
      name: name || fullName, 
      fullName: fullName || name, 
      email,
      password,
      role: userRoles,
      staff_approval,
      status: 'active', 
      loginIPs: [{ ip: getClientIP(req) }],
      notifications: initialNotifications
    });


    const token = generateToken(user);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        userId: user.userId,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Could not register user',
      error: error.message
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update login history and check if this is a new IP
    const clientIP = getClientIP(req);
    const isNewIP = await updateLoginHistory(user, clientIP);
    
    // Update user status to active
    user.status = 'active';
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        userId: user.userId,
        name: user.name,
        fullName: user.fullName || user.name, 
        email: user.email,
        role: user.role,
        token,
        isNewIP,
        newLocation: isNewIP
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
};


const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      status: 'success',
      data: {
        userId: user.userId,
        name: user.name,
        fullName: user.fullName || user.name,
        email: user.email,
        role: user.role,
        bloodType: user.bloodType,
        profile_completed: user.profile_completed,
        profileCompletion: user.profileCompletion,
        profileCompletionDetails: user.profileCompletionDetails,
        kycStatus: user.kycStatus,
        loginIPs: user.loginIPs,
        lastLogin: user.lastLogin,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Could not fetch profile',
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    user.status = 'inactive';
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Logged out successfully',
      data: null
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error during logout',
      error: error.message
    });
  }
};

const logoutAll = async (req, res) => {
  try {
    const user = req.user;

    user.resetJWTVersion();
    user.status = 'inactive';
    await user.save();

    res.json({
      status: 'success',
      message: 'Logged out from all devices',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Could not logout from all devices',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  logoutAll
};
