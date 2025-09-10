const User = require('../../models/User');
const AppError = require('../../utils/appError');
const { catchAsync } = require('../../utils/errorHandlers');
const bcrypt = require('bcryptjs');

 
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, logoutAllDevices } = req.body;
  const userId = req.user._id;
   
  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide both current password and new password', 400);
  }
   
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
   
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new AppError('Current password is incorrect', 401);
  }
   
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400);
  }
  
  if (!/[0-9]/.test(newPassword)) {
    throw new AppError('New password must contain at least one number', 400);
  }
  
  if (!/[!@#$%^&*]/.test(newPassword)) {
    throw new AppError('New password must contain at least one special character', 400);
  }
  
  if (!/[A-Z]/.test(newPassword)) {
    throw new AppError('New password must contain at least one uppercase letter', 400);
  }
  
  if (!/[a-z]/.test(newPassword)) {
    throw new AppError('New password must contain at least one lowercase letter', 400);
  }
  
 
  user.password = newPassword;
   
  if (logoutAllDevices) {
    user.resetJWTVersion();
  }
   
  const passwordChangeNotification = {
    message: "Your password has been changed successfully. If you didn't make this change, please contact support immediately.",
    time: new Date(),
    from: "System",
    isRead: false,
    type: "reminder"
  };
  
  user.notifications = user.notifications || [];
  user.notifications.unshift(passwordChangeNotification);
  
  await user.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
    data: {
      logoutAllDevices: !!logoutAllDevices
    }
  });
});
