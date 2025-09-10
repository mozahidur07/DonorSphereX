const User = require('../../models/User');
const Donation = require('../../models/Donation');
const Request = require('../../models/Request');
const appError = require('../../utils/appError');
const catchAsync = require('../../utils/errorHandlers').catchAsync;
 
exports.getDashboardData = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }
 
  const userCount = await User.countDocuments();
  const activeUsersCount = await User.countDocuments({ status: 'active' });
  const donationCount = await Donation.countDocuments();
  const requestCount = await Request.countDocuments();
  const completedDonations = await Donation.countDocuments({ status: 'completed' });
  const pendingRequests = await Request.countDocuments({ status: 'pending' });
   
  const kycPendingCount = await User.countDocuments({
    kycStatus: { $nin: ['completed', 'approved'] }
  });
 
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email userId createdAt');
 
  const recentDonations = await Donation.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('donationType type status createdAt userId userName');
 
  const recentRequests = await Request.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userObjectId', 'name lastName email')
    .select('type urgency status createdAt userId');
 
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const donationsByMonth = await Donation.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { 
          year: { $year: "$createdAt" }, 
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    },
    {
      $project: {
        _id: 0,
        month: {
          $let: {
            vars: {
              monthsInString: [
                "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
              ]
            },
            in: { 
              $concat: [
                { $arrayElemAt: ["$$monthsInString", "$_id.month"] },
                " ",
                { $toString: "$_id.year" }
              ]
            }
          }
        },
        count: 1
      }
    }
  ]);
 
  const requestsByType = await Request.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        type: "$_id",
        count: 1
      }
    }
  ]);
 
  const donationStatus = await Donation.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1
      }
    }
  ]);
   
  const statusMap = new Map();
  donationStatus.forEach(item => {
    statusMap.set(item.status || 'pending', item);
  });
  
  const requiredStatuses = ['pending', 'completed', 'rejected'];
  const processedDonationStatus = [];
  
  requiredStatuses.forEach(status => {
    if (statusMap.has(status)) {
      processedDonationStatus.push(statusMap.get(status));
    } else {
      processedDonationStatus.push({ status, count: 0 });
    }
  });
  
  console.log("Processed donation status data:", processedDonationStatus);
 
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  const processedDonationsByMonth = [];
   
  const monthDataMap = new Map();
  donationsByMonth.forEach(item => {
    monthDataMap.set(item.month, item);
  });
   
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setMonth(currentDate.getMonth() - i);
    
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();  
    const monthStr = `${monthNames[month]} ${year}`;
    
    if (monthDataMap.has(monthStr)) {
      processedDonationsByMonth.push(monthDataMap.get(monthStr));
    } else {
      processedDonationsByMonth.push({ month: monthStr, count: 0 });
    }
  }

  console.log("Processed donations by month:", processedDonationsByMonth);
   
  const kycPendingUsers = await User.find({
    kycStatus: { $nin: ['completed', 'approved'] }
  }).select('userId name email kycStatus createdAt');

  console.log(`KYC pending users count: ${kycPendingUsers.length}`);
  console.log('Sample of KYC pending users:', kycPendingUsers.slice(0, 3).map(user => ({
    userId: user.userId,
    name: user.name,
    kycStatus: user.kycStatus
  })));
   
  const pendingKycUsers = kycPendingUsers;
    
  const pendingKycUserList = pendingKycUsers.map(user => ({
    userId: user.userId,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    kycStatus: user.kycStatus || 'pending'
  }));
     
  const pendingKycUserIds = pendingKycUsers.map(user => user.userId);
    
  console.log(`Users needing KYC count: ${pendingKycUserIds.length}`);
  console.log(`Sample of user IDs needing KYC: ${pendingKycUserIds.slice(0, 5)}`);
   
  const kycCompletedCount = await User.countDocuments({
    kycStatus: { $in: ['completed', 'approved'] }
  });
  
  const completedKycUsers = await User.find({
    kycStatus: { $in: ['completed', 'approved'] }
  }).select('userId name email kycStatus createdAt').limit(5);
  
  console.log(`Users with completed KYC count: ${kycCompletedCount}`);
  console.log('Sample of completed KYC users:', completedKycUsers.map(user => ({
    userId: user.userId,
    name: user.name,
    kycStatus: user.kycStatus
  })));
  
  res.status(200).json({
    status: 'success',
    data: {
      userCount,
      activeUsersCount,  
      donationCount,
      requestCount,
      completedDonations,
      pendingRequests,
      kycPendingCount,
      kycCompletedCount,
      recentUsers,
      recentDonations,
      recentRequests,
      donationsByMonth: processedDonationsByMonth, 
      requestsByType,
      donationStatus: processedDonationStatus,  
      pendingKycUsers: pendingKycUserList,  
      completedKycUsers  
    }
  });
});
 
exports.getAllUsers = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }
 
  const users = await User.find()
    .select('-password -passwordResetToken -passwordResetExpires');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users
  });
}); 
exports.getUser = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }
 
  let user = await User.findOne({ userId: req.params.id })
    .select('-password -passwordResetToken -passwordResetExpires');
   
  if (!user) {
    user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires');
  }

  if (!user) {
    return next(new appError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});
 
exports.updateUserRoles = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }
 
  let targetUser = await User.findOne({ userId: req.params.id });
   
  if (!targetUser) {
    targetUser = await User.findById(req.params.id);
  }
  
  if (!targetUser) {
    return next(new appError('No user found with that ID', 404));
  }
 
  if (targetUser.role?.admin && !req.user.role.admin) {
    return next(new appError('Only administrators can modify admin accounts', 403));
  }
 
  let updatedUser;
  if (targetUser.userId === req.params.id) { 
    updatedUser = await User.findOneAndUpdate(
      { userId: req.params.id },
      {
        role: req.body.role,
        staff_approval: req.body.staff_approval
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password -passwordResetToken -passwordResetExpires');
  } else { 
    updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        role: req.body.role,
        staff_approval: req.body.staff_approval
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password -passwordResetToken -passwordResetExpires');
  }
 
  try {
    const notificationUtils = require('../../utils/notificationUtils');
     
    let notificationData = {
      title: 'Account Role Update',
      message: 'Your account permissions have been updated by administrator.',
      type: 'verification',
      priority: 'high',
      isRead: false,
      createdAt: new Date()
    };
     
    if (req.body.role && req.body.role.staff) {
      if (req.body.staff_approval) {
        notificationData.message = 'You have been granted staff privileges on the platform.';
        notificationData.type = 'success';
      } else {
        notificationData.message = 'Your staff access is pending approval.';
        notificationData.type = 'verification';
      }
    } 

    await notificationUtils.addStaffNotification(
      updatedUser.userId, 
      notificationData, 
      req.user
    );
    
    console.log(`Role update notification sent to user ${updatedUser.userId}`);
  } catch (notifError) {
    console.error('Error sending role update notification:', notifError); 
  }

  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});
 
exports.updateKycStatus = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }

  console.log("Received KYC status update request with body:", req.body);
  
  const { status, rejection_reason } = req.body;
  if (!['pending', 'approved', 'rejected', 'not_submitted'].includes(status)) {
    console.error(`Invalid KYC status received: ${status}`);
    return next(new appError(`Invalid KYC status: ${status}. Must be one of: pending, approved, rejected, not_submitted`, 400));
  }
 
  const updateData = {
    kycStatus: status,
  };
 
  if (status === 'rejected') {
    updateData.kyc_rejection_reason = rejection_reason;
  }
 
  if (status === 'approved') {
    updateData.kycStatus = 'completed';
  }

  console.log("Updating user KYC status with:", updateData);
 
  let updatedUser;
  let user = await User.findOne({ userId: req.params.id });
  
  if (user) { 
    updatedUser = await User.findOneAndUpdate(
      { userId: req.params.id },
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -passwordResetToken -passwordResetExpires');
  } else { 
    updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -passwordResetToken -passwordResetExpires');
  }

  if (!updatedUser) {
    return next(new appError('No user found with that ID', 404));
  }

  console.log("Updated user KYC status:", updatedUser.kycStatus);
   
  try {
    const notificationUtils = require('../../utils/notificationUtils');
     
    const notificationData = notificationUtils.createKycStatusNotification(
      status, 
      rejection_reason
    ); 
    notificationData.message += ` (By Staff ID: ${req.user.userId})`;
     
    await notificationUtils.addStaffNotification(
      updatedUser.userId, 
      notificationData, 
      req.user
    );
    
    console.log(`KYC status change notification sent to user ${updatedUser.userId}`);
  } catch (notifError) {
    console.error('Error sending KYC status notification:', notifError); 
  }

  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
}); 

exports.getUserKycDocuments = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }
  
  let user = await User.findOne({ userId: req.params.id })
    .select('kycDocuments');

  if (!user) {
    user = await User.findById(req.params.id)
      .select('kycDocuments');
  }

  if (!user) {
    return next(new appError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user.kycDocuments || []
  });
});
 
exports.updateKycDocumentStatus = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }

  const { status, rejectionReason } = req.body;
  if (!['pending', 'verified', 'rejected'].includes(status)) {
    return next(new appError('Invalid document status', 400));
  }
 
  if (status === 'rejected' && !rejectionReason) {
    return next(new appError('Rejection reason is required when rejecting document', 400));
  }
 
  let user = await User.findOne({ userId: req.params.id });
  if (!user) {
    user = await User.findById(req.params.id);
  }
  
  if (!user) {
    return next(new appError('No user found with that ID', 404));
  }

 
  const documentIndex = user.kycDocuments.findIndex(
    doc => doc._id.toString() === req.params.docId
  );

  if (documentIndex === -1) {
    return next(new appError('No document found with that ID', 404));
  }
 
  user.kycDocuments[documentIndex].status = status;
  if (status === 'rejected') {
    user.kycDocuments[documentIndex].rejectionReason = rejectionReason;
  }

  await user.save();
 
  try {
    const notificationUtils = require('../../utils/notificationUtils');
     
    let notificationData = {
      title: 'Document Verification Update',
      type: 'verification',
      priority: 'high',
      isRead: false,
      createdAt: new Date()
    };
    
    const document = user.kycDocuments[documentIndex];
    const docType = document.documentType || 'Verification document';
     
    switch (status) {
      case 'verified':
        notificationData.message = `Your ${docType} has been verified successfully.`;
        notificationData.type = 'success';
        break;
      case 'rejected':
        notificationData.message = `Your ${docType} has been rejected. Reason: ${rejectionReason || 'Does not meet requirements'}`;
        notificationData.type = 'urgent';
        break;
      case 'pending':
        notificationData.message = `Your ${docType} status has been set to pending review.`;
        notificationData.type = 'verification';
        break;
    }
     
    await notificationUtils.addStaffNotification(
      user.userId, 
      notificationData, 
      req.user
    );
    
    console.log(`Document status change notification sent to user ${user.userId}`);
  } catch (notifError) {
    console.error('Error sending document status notification:', notifError);
 
  }

  res.status(200).json({
    status: 'success',
    data: user.kycDocuments[documentIndex]
  });
});
