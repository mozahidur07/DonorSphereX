const Request = require('../../models/Request');
const User = require('../../models/User');
const AppError = require('../../utils/appError');

exports.createRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
     
    const requestData = {
      ...req.body,
      userId
    };
     
    const request = await Request.create(requestData);
     
    await User.findByIdAndUpdate(
      userId,
      { $push: { requestHistory: request._id } },
      { new: true }
    );
    
    res.status(201).json({
      status: 'success',
      data: request
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getUserRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;  
    const requests = await Request.find({ userId: userId })
      .populate('userObjectId', 'firstName lastName email bloodType')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${requests.length} requests for user ${userId}`);
    console.log('Request details:', JSON.stringify(requests, null, 2));
    
    res.status(200).json({
      status: 'success',
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error in getUserRequests:', error);
    next(new AppError(error.message, 400));
  }
};
 
exports.getUserRequestsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
     
    if (!req.user.role?.admin && !req.user.role?.staff) {
      return next(new AppError('You are not authorized to access this resource', 403));
    }
   
    let requests = [];
     
    requests = await Request.find({ userId: userId })
      .populate('userObjectId', 'firstName lastName email bloodType')
      .sort({ createdAt: -1 });
     
    if (requests.length === 0) {
      try {
         
        const user = await User.findById(userId);
        if (user) { 
          requests = await Request.find({ userId: user.userId })
            .populate('userObjectId', 'firstName lastName email bloodType')
            .sort({ createdAt: -1 });
        }
      } catch (err) { 
        console.log('Not a valid MongoDB ID or user not found:', err.message);
      }
    }
    
    res.status(200).json({
      status: 'success',
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;
    
  
    const request = await Request.findById(requestId);
    
    if (!request) {
      return next(new AppError('Request not found', 404));
    }
    
 
    if (request.userId.toString() !== userId && !req.user.isAdmin) {
      return next(new AppError('You are not authorized to access this request', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: request
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;
    
 
    const request = await Request.findById(requestId);
    
    if (!request) {
      return next(new AppError('Request not found', 404));
    }
 
    if (request.userId.toString() !== userId && !req.user.isAdmin) {
      return next(new AppError('You are not authorized to update this request', 403));
    }
 
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: updatedRequest
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.userId;
    
 
    const request = await Request.findById(requestId);
    
    if (!request) {
      return next(new AppError('Request not found', 404));
    }
     
    if (request.userId.toString() !== userId && !req.user.isAdmin) {
      return next(new AppError('You are not authorized to delete this request', 403));
    }
     
    await User.findByIdAndUpdate(
      userId,
      { $pull: { requestHistory: requestId } },
      { new: true }
    );
     
    await Request.findByIdAndDelete(requestId);
    
    res.status(200).json({
      status: 'success',
      message: 'Request deleted successfully'
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

exports.getAllRequests = async (req, res, next) => {
  try { 
    if (!req.user.isAdmin) {
      return next(new AppError('You are not authorized to access all requests', 403));
    }
     
    const requests = await Request.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: requests
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
 
exports.getRequestByReferenceId = async (req, res, next) => {
  try {
    const { referenceId } = req.params;
     
    const request = await Request.findOne({ requestId: referenceId });
    
    if (!request) {
      return next(new AppError('Request not found', 404));
    }
     
    const publicData = {
      requestId: request.requestId,
      type: request.type,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
    
    res.status(200).json({
      status: 'success',
      data: publicData
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};
