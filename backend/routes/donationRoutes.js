const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation/donationController');
const authMiddleware = require('../middleware/auth');
 
router.use(authMiddleware.protect);

// GET all donations (admin/staff only)
router.get(
  '/all', 
  authMiddleware.restrictTo('admin', 'staff'), 
  donationController.getAllDonations
);

// GET donation statistics (admin/staff only)
router.get(
  '/stats', 
  authMiddleware.restrictTo('admin', 'staff'), 
  donationController.getDonationStats
);

// GET donations for a specific user (admin/staff only)
router.get(
  '/user/:userId',
  authMiddleware.restrictTo('admin', 'staff'),
  donationController.getUserDonationsByUserId
);

// GET current user's donations
router.get(
  '/',
  donationController.getUserDonations
);

// GET donation by ID
router.get(
  '/:id', 
  donationController.getDonationById
);

// POST new donation
router.post('/', donationController.createDonation);

// PUT/UPDATE donation status
router.put(
  '/:id/status',
  authMiddleware.restrictTo('admin', 'staff'),
  donationController.updateDonationStatus
);

// DELETE donation (admin only)
router.delete(
  '/:id',
  authMiddleware.restrictTo('admin'),
  donationController.deleteDonation
);

module.exports = router;
