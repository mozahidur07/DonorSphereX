const Request = require('../../models/Request');
const appError = require('../../utils/appError');
const catchAsync = require('../../utils/errorHandlers').catchAsync;

 
exports.getAllRequests = catchAsync(async (req, res, next) => {
  
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }
 
  const filter = {};
  
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.bloodType) filter.bloodType = req.query.bloodType;
  if (req.query.urgency) filter.urgency = req.query.urgency;
  if (req.query.userId) filter.userId = req.query.userId;
  
 
  if (req.query.requestId) filter.requestId = req.query.requestId;
  
 
  if (req.query.userEmail) { 
    try {
      const User = require('../../models/User');
      const user = await User.findOne({ email: { $regex: new RegExp(req.query.userEmail, 'i') } });
      if (user) {
        filter.userId = user.userId;
      } else { 
        filter.userId = 'no-match-found';
      }
    } catch (err) {
      console.error('Error searching by email:', err);
    }
  }
   
  const requests = await Request.find(filter)
    .populate('userObjectId', 'firstName lastName email bloodType')
    .sort({ urgency: -1, createdAt: -1 });

  res.status(200).json({
    status: 'success',
    count: requests.length,
    data: requests
  });
});
 
exports.getRequestById = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }
 
  let request = await Request.findById(req.params.id)
    .populate('userObjectId', 'firstName lastName email bloodType');
   
  if (!request) {
    request = await Request.findOne({ requestId: req.params.id })
      .populate('userObjectId', 'firstName lastName email bloodType');
  }

  if (!request) {
    return next(new appError('No request found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: request
  });
});
 
exports.updateRequestStatus = catchAsync(async (req, res, next) => { 
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(new appError('You do not have permission to access this resource', 403));
  }

  const { status, rejectionReason } = req.body;
  
  if (!['pending', 'completed', 'rejected', 'matched', 'fulfilled', 'cancelled'].includes(status)) {
    return next(new appError('Invalid status value', 400));
  }
   
  if (status === 'rejected' && !rejectionReason) {
    return next(new appError('Rejection reason is required when rejecting a request', 400));
  } 
  const updateData = { status };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
 
  let updatedRequest = await Request.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('userObjectId', 'firstName lastName email bloodType');
 
  if (!updatedRequest) {
    updatedRequest = await Request.findOneAndUpdate(
      { requestId: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('userObjectId', 'firstName lastName email bloodType');
  }

  if (!updatedRequest) {
    return next(new appError('No request found with that ID', 404));
  }
 
  try {
    const notificationUtils = require('../../utils/notificationUtils');
     
    const notificationData = notificationUtils.createRequestStatusNotification(
      status, 
      updatedRequest.requestId, 
      updatedRequest.type,
      rejectionReason
    );
     
    await notificationUtils.addStaffNotification(
      updatedRequest.userId, 
      notificationData, 
      req.user
    );
    
    console.log(`Request status change notification sent to user ${updatedRequest.userId}`);
  } catch (notifError) {
    console.error('Error sending request status notification:', notifError);
   
  }

  res.status(200).json({
    status: 'success',
    data: updatedRequest
  });
});
