const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff/staffController');
const requestController = require('../controllers/staff/requestController');
const authMiddleware = require('../middleware/auth');
 
router.use(authMiddleware.protect);
 
router.use((req, res, next) => {
  if (!req.user.role.staff || !req.user.staff_approval) {
    return res.status(403).json({ 
      status: 'fail',
      message: 'You do not have permission to access these resources'
    });
  }
  next();
});
 
router.get('/dashboard', staffController.getDashboardData);

// User management routes
router.get('/users', staffController.getAllUsers);
router.get('/users/:id', staffController.getUser);
router.patch('/users/:id/roles', staffController.updateUserRoles);
router.patch('/users/:id/kyc', staffController.updateKycStatus);
router.get('/users/:id/kyc', staffController.getUserKycDocuments);
router.patch('/users/:id/kyc/:docId/status', staffController.updateKycDocumentStatus);

// Request management routes
router.get('/requests', requestController.getAllRequests);
router.get('/requests/:id', requestController.getRequestById);
router.patch('/requests/:id/status', requestController.updateRequestStatus);

module.exports = router;
