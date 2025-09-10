const User = require('../models/User');
const crypto = require('crypto');
 
exports.addStaffNotification = async (targetUserId, notificationData, staffUser) => {
  try {
    // Validate inputs
    if (!targetUserId || !notificationData || !notificationData.message || !notificationData.type) {
      console.error('Invalid notification data:', { targetUserId, notificationData });
      return false;
    }

    if (!staffUser || !staffUser.userId) {
      console.error('Invalid staff user data:', staffUser);
      return false;
    }

    console.log(`Adding notification to user ${targetUserId} from staff ${staffUser.userId}`);
 
    const user = await User.findOne({ userId: targetUserId });
    
    if (!user) { 
      const userById = await User.findById(targetUserId);
      if (!userById) {
        console.error(`User not found with ID: ${targetUserId}`);
        return false;
      } 
      user = userById;
    }
    
 
    const newNotification = {
      id: crypto.randomBytes(8).toString('hex'),
      message: notificationData.message,
      time: new Date(),
      from: 'Staff',
      staffId: staffUser.userId,   
      staffName: staffUser.name || staffUser.fullName || 'Staff Member', 
      isRead: false,
      type: notificationData.type
    };
     
    user.notifications = user.notifications || [];
    user.notifications.unshift(newNotification); 
    
    await user.save();
    
    console.log(`Notification added successfully to user ${targetUserId}`);
    return true;
  } catch (error) {
    console.error('Error adding staff notification:', error);
    return false;
  }
};

exports.createKycStatusNotification = (status, rejectionReason) => {
  let message = '';
  let type = 'verification';
  
  switch(status) {
    case 'approved':
    case 'completed':
      message = 'Your KYC verification has been approved.';
      type = 'success';
      break;
    case 'rejected':
      message = `Your KYC verification has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`;
      type = 'urgent';
      break;
    case 'pending':
      message = 'Your KYC verification is under review.';
      type = 'verification';
      break;
    case 'not_submitted':
      message = 'Your KYC status has been reset to not submitted. Please submit your documents.';
      type = 'reminder';
      break;
    default:
      message = `Your KYC status has been updated to ${status}.`;
      type = 'verification';
  }
  
  return { message, type };
};

exports.createDonationStatusNotification = (status, donationId, donationType, statusNotes) => {
  let message = '';
  let type = 'success';
  
  switch(status) {
    case 'approved':
      message = `Your ${donationType} donation (ID: ${donationId}) has been approved.`;
      type = 'success';
      break;
    case 'processing':
      message = `Your ${donationType} donation (ID: ${donationId}) is now being processed.`;
      type = 'verification';
      break;
    case 'completed':
      message = `Your ${donationType} donation (ID: ${donationId}) has been completed. Thank you!`;
      type = 'appreciation';
      break;
    case 'rejected':
      message = `Your ${donationType} donation (ID: ${donationId}) has been rejected.${statusNotes ? ` Reason: ${statusNotes}` : ''}`;
      type = 'urgent';
      break;
    case 'cancelled':
      message = `Your ${donationType} donation (ID: ${donationId}) has been cancelled.${statusNotes ? ` Reason: ${statusNotes}` : ''}`;
      type = 'verification';
      break;
    default:
      message = `Your ${donationType} donation (ID: ${donationId}) status has been updated to ${status}.`;
      type = 'verification';
  }
  
  return { message, type };
};

exports.createRequestStatusNotification = (status, requestId, requestType, rejectionReason) => {
  let message = '';
  let type = 'verification';
  
  switch(status) {
    case 'completed':
      message = `Your ${requestType} request (ID: ${requestId}) has been completed.`;
      type = 'success';
      break;
    case 'matched':
      message = `Good news! Your ${requestType} request (ID: ${requestId}) has been matched with a donor.`;
      type = 'success';
      break;
    case 'fulfilled':
      message = `Your ${requestType} request (ID: ${requestId}) has been fulfilled.`;
      type = 'appreciation';
      break;
    case 'rejected':
      message = `Your ${requestType} request (ID: ${requestId}) has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
      type = 'urgent';
      break;
    case 'cancelled':
      message = `Your ${requestType} request (ID: ${requestId}) has been cancelled.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
      type = 'verification';
      break;
    default:
      message = `Your ${requestType} request (ID: ${requestId}) status has been updated to ${status}.`;
      type = 'verification';
  }
  
  return { message, type };
};
