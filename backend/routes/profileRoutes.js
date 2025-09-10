const express = require('express');
const router = express.Router(); 
const profileController = require('../controllers/profile/profileController');
const passwordController = require('../controllers/profile/passwordController');
const { protect } = require('../middleware/auth');
const { 
  uploadKycDocument, 
  uploadProfilePicture, 
  handleMulterError 
} = require('../utils/fileUpload');
 
router.use(protect);

 
router.get('/', profileController.getProfile);

 
router.put('/update', profileController.updateProfile);

 
router.post('/upload-kyc', 
  uploadKycDocument, 
  handleMulterError,
  profileController.uploadKycDocument
);
 
router.post('/update-kyc', profileController.updateKycDocumentFromSupabase);
 
router.post('/upload-profile-picture',
  uploadProfilePicture,
  handleMulterError,
  profileController.uploadProfilePicture
);
 
router.put('/change-password', passwordController.changePassword);
 
router.patch('/kyc/:userId', profileController.updateKycStatus);
router.get('/kyc/pending', profileController.getPendingKycVerifications);

module.exports = router;
