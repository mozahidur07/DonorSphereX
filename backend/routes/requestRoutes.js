const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const requestController = require('../controllers/requests/requestController');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
 
const authenticateUser = (req, res, next) => {
  try { 
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
 
    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET || 'life_donner_secure_jwt_secret';
    console.log('Using JWT_SECRET:', JWT_SECRET);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET); 
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
        error: jwtError.message
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
      error: error.message
    });
  }
};

router.get('/', async (req, res) => {
  try {
    console.log('GET /api/requests query params:', req.query);
     
    const filter = {};
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.bloodType) filter.bloodType = req.query.bloodType;
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.userId) {
      filter.userId = req.query.userId;
      console.log('Filtering by userId:', req.query.userId);
    }
    
    console.log('Filter criteria:', filter);
    
    const requests = await Request.find(filter)
      .populate('userObjectId', 'firstName lastName email bloodType')
      .sort({ urgency: -1, createdAt: -1 });
    
    console.log(`Found ${requests.length} requests`);
    
    res.json({
      status: 'success',
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});
  
router.get('/:id', async (req, res) => {
  try { 
    let request = await Request.findById(req.params.id)
      .populate('userObjectId', 'firstName lastName email bloodType')
      .populate('fulfilledBy.donorId', 'firstName lastName bloodType');
     
    if (!request) {
      request = await Request.findOne({ requestId: req.params.id })
        .populate('userObjectId', 'firstName lastName email bloodType')
        .populate('fulfilledBy.donorId', 'firstName lastName bloodType');
    }
    
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }
    
    res.json({
      status: 'success',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch request',
      error: error.message
    });
  }
});

// POST new request
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log('Request body received:', req.body);
     
    const userIdentifier = req.user.id; b
    console.log('User identifier from token:', userIdentifier);
    
    if (!userIdentifier) {
      return res.status(401).json({
        status: 'error',
        message: 'User ID not found in token'
      });
    }
     
    const User = require('../models/User');
    let user;
    try {
      user = await User.findOne({ userId: userIdentifier });
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found with ID: ' + userIdentifier
        });
      }
      
      console.log('Found user with _id:', user._id);
    } catch (userError) {
      console.error('Error finding user:', userError);
      return res.status(500).json({
        status: 'error',
        message: 'Error finding user: ' + userError.message
      });
    }
     
    const requestData = {
      ...req.body,
      userId: userIdentifier, 
      userObjectId: user._id, 
      requesterId: user._id  
    };
     
    if (requestData.type === 'blood') { 
      if (requestData.quantity && typeof requestData.quantity === 'string') {
        requestData.quantity = parseInt(requestData.quantity, 10);
      }
       
      if (!requestData.quantity) {
        requestData.quantity = 1;
      }
    } else if (requestData.type === 'organ') { 
      if (requestData.organType && !requestData.organ) {
        requestData.organ = requestData.organType;
      }
    }
     
    if (requestData.urgency) { 
      requestData.urgency = requestData.urgency.toLowerCase();
       
      const urgencyMap = {
        'normal': 'medium',
        'standard': 'low',
        'elevated': 'medium',
        'urgent': 'high',
        'emergency': 'critical'
      };
      
      if (urgencyMap[requestData.urgency]) {
        requestData.urgency = urgencyMap[requestData.urgency];
      }
    }
    
    console.log('Modified request data:', requestData);
    
    const newRequest = new Request(requestData);
    const savedRequest = await newRequest.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Request created successfully',
      data: savedRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create request: ' + error.message,
      error: error.message
    });
  }
});

// PUT update request
router.put('/:id', async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to update request',
      error: error.message
    });
  }
});

// POST fulfill request (add a donor)
router.post('/:id/fulfill', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }
    
    // Add fulfillment info
    request.fulfilledBy.push({
      donorId: req.body.donorId,
      donationId: req.body.donationId,
      quantity: req.body.quantity || 1
    });
    
    // Update status if fully fulfilled
    if (request.type === 'blood' && 
        request.fulfilledBy.reduce((total, item) => total + item.quantity, 0) >= request.quantity) {
      request.status = 'fulfilled';
    } else if (request.type === 'organ' && request.fulfilledBy.length > 0) {
      request.status = 'matched';
    }
    
    const updatedRequest = await request.save();
    
    res.json({
      status: 'success',
      message: 'Request fulfillment updated',
      data: updatedRequest
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to fulfill request',
      error: error.message
    });
  }
});
 
router.get(
  '/user/:userId', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('admin', 'staff'), 
  requestController.getUserRequestsByUserId
);

// GET current user's requests
router.get(
  '/my-requests',
  authMiddleware.protect,
  requestController.getUserRequests
);

// Update request status
router.patch('/:id/status', authMiddleware.protect, authMiddleware.restrictTo('admin', 'staff'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['pending', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }
    
    // Update request status
    request.status = status;
    if (rejectionReason) {
      request.rejectionReason = rejectionReason;
    }
    
    await request.save();
    
    res.json({
      status: 'success',
      message: 'Request status updated successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update request status',
      error: error.message
    });
  }
});

// DELETE request
router.delete('/:id', async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    
    if (!deletedRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete request',
      error: error.message
    });
  }
});

module.exports = router;
