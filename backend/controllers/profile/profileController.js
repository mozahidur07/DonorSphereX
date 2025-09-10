const User = require('../../models/User');
const AppError = require('../../utils/appError');
const { catchAsync } = require('../../utils/errorHandlers');
const path = require('path');
const fs = require('fs').promises;


exports.getProfile = catchAsync(async (req, res) => {
  const userId = req.user._id;
   
  const user = await User.findById(userId).select('-password')
    .populate({
      path: 'donationHistory',
      select: 'donationType donationDate location amount status',
      options: { sort: { 'donationDate': -1 }, limit: 10 }
    });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
   
  const userData = user.toObject();
  
  if (userData.lastDonation) {
    userData.lastDonation = userData.lastDonation.toISOString().split('T')[0];
  }
  
  if (userData.nextEligibleDonation) {
    userData.nextEligibleDonation = userData.nextEligibleDonation.toISOString().split('T')[0];
  }
   
  if (userData.kycDocument && userData.kycDocument.url) {
    userData.kycDocuments = userData.kycDocuments || {};
     
    if (!userData.kycDocuments.aadharCard || !userData.kycDocuments.aadharCard.url) {
      userData.kycDocuments.aadharCard = { url: userData.kycDocument.url };
    }
  }
   
  if (userData.donationHistory && userData.donationHistory.length > 0) {
    userData.donationHistory = userData.donationHistory.map(donation => ({
      ...donation,
      date: donation.donationDate ? donation.donationDate.toISOString().split('T')[0] : 'N/A'
    }));
  }
  
  res.status(200).json({
    status: 'success',
    data: userData
  });
});

 
exports.updateProfile = catchAsync(async (req, res) => {
  if (!req.user || (!req.user._id && !req.user.userId)) {
    throw new AppError('User not authenticated properly', 401);
  }
 
  const userId = req.user._id;  
  const updateFields = req.body;
   
  const protectedFields = ['password', 'email', 'role', 'kycStatus', 'isVerified', 
    'kycDocument', 'donationHistory', 'lastDonation', 'nextEligibleDonation'];
   
  protectedFields.forEach(field => {
    if (updateFields[field]) {
      delete updateFields[field];
    }
  });
   
  if (updateFields.gender) { 
    const validGenderValues = ['male', 'female', 'other', 'prefer_not_to_say', 'prefer not to say'];
    if (!validGenderValues.includes(updateFields.gender)) {
      console.error("Invalid gender value:", updateFields.gender);
      throw new AppError(`Invalid gender value: ${updateFields.gender}`, 400);
    }
  }
   
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
   
  const previousValues = {};
  const updateType = determineUpdateType(updateFields);
  
  Object.keys(updateFields).forEach(key => {
    previousValues[key] = user[key];
  });
  
  try {
    
    
    const isBloodTypeUpdate = updateFields.bloodType && 
                              updateFields.bloodType !== user.bloodType && 
                              updateFields.bloodType !== 'unknown';
     
    if (updateFields.kycDocument) {
      updateFields.kycDocuments = updateFields.kycDocuments || {};
      updateFields.kycDocuments.aadharCard = { 
        url: updateFields.kycDocument.url 
      };
    }
     
    if (updateFields.dateOfBirth) {
      try {
        updateFields.dateOfBirth = new Date(updateFields.dateOfBirth);
      } catch (error) {

      }
    }
   
    if (updateFields.medicalInfo) {
      user.medicalInfo = user.medicalInfo || {};
       
      const medicalInfoKeys = Object.keys(updateFields.medicalInfo);
      for (const key of medicalInfoKeys) { 
        if (key === 'lastCheckup' && updateFields.medicalInfo[key]) {
          try {
            user.medicalInfo[key] = new Date(updateFields.medicalInfo[key]);
          } catch (error) {
            
          }
        } else {
          user.medicalInfo[key] = updateFields.medicalInfo[key];
        }
      }
       
      delete updateFields.medicalInfo;
    }
    
    if (updateFields.address) {
      user.address = user.address || {};
       
      const addressKeys = Object.keys(updateFields.address);
      for (const key of addressKeys) {
        user.address[key] = updateFields.address[key];
      }
       
      delete updateFields.address;
    }
    
    Object.keys(updateFields).forEach(key => { 
      if (key === 'profileCompletionDetails') {
        
      } else if (key === 'dateOfBirth' && updateFields[key]) {
        try {
          user[key] = new Date(updateFields[key]);
        } catch (error) {

        }
      } else {
        user[key] = updateFields[key];
      }
    }); 
    const updatedUser = await user.save();
     
    if (isBloodTypeUpdate) {
      const bloodTypeNotification = {
        message: `Your blood type has been updated to ${updateFields.bloodType}`,
        time: new Date(),
        from: "System",
        isRead: false,
        type: "success"
      };
      
      updatedUser.notifications = updatedUser.notifications || [];
      updatedUser.notifications.unshift(bloodTypeNotification); 
    }
   
    const completionDetails = calculateProfileCompletion(updatedUser);
     
    updatedUser.profileCompletion = completionDetails.completionPercentage;
     
    updatedUser.profileCompletionDetails = {
      basicInfo: !!completionDetails.completionDetails.basicInfo,
      contactInfo: !!completionDetails.completionDetails.contactInfo,
      medicalInfo: !!completionDetails.completionDetails.medicalInfo,
      kycVerification: !!completionDetails.completionDetails.kycVerification
    };
    
    updatedUser.profile_completed = completionDetails.completionPercentage === 100;
     
    const isProfileCompleted = completionDetails.completionDetails.basicInfo && 
                             completionDetails.completionDetails.contactInfo &&
                             completionDetails.completionDetails.medicalInfo;
     
    const wasProfileCompleted = user.profile_completed;
    const isNowCompleted = isProfileCompleted && !wasProfileCompleted;
     
    const isFirstBasicUpdate = updateType === 'profile' && !user.profileCompletionDetails?.basicInfo && 
                               completionDetails.completionDetails.basicInfo;
    
    if (isNowCompleted) {
      const profileCompletionNotification = {
        message: "Profile update completed successfully",
        time: new Date(),
        from: "System",
        isRead: false,
        type: "success"
      };
      
      updatedUser.notifications = updatedUser.notifications || [];
      updatedUser.notifications.unshift(profileCompletionNotification);  
      
      if (!completionDetails.completionDetails.kycVerification) {
        const kycReminderNotification = {
          message: "Verify your KYC details to complete your profile",
          time: new Date(),
          from: "System",
          isRead: false,
          type: "verification"
        };
        
        updatedUser.notifications.unshift(kycReminderNotification);
      }
    }
     
    if (isFirstBasicUpdate) {
      const basicDetailsNotification = {
        message: "Your basic profile details have been updated successfully",
        time: new Date(),
        from: "System",
        isRead: false,
        type: "success"
      };
      
      updatedUser.notifications = updatedUser.notifications || [];
      updatedUser.notifications.unshift(basicDetailsNotification);
    } 
    await updatedUser.save();
     
    res.status(200).json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    throw error;  
  }
});

 
exports.uploadKycDocument = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  let kycDocumentData = {};
  
  if (req.body.kycDocument && req.body.kycDocument.url) {
    kycDocumentData = {
      ...req.body.kycDocument,
      uploadedAt: new Date()
    };
  } else if (req.file) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = req.file.path.replace(/\\/g, '/').replace('backend/', '');
    const fileUrl = `${baseUrl}/${relativePath}`;
    
    kycDocumentData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
      url: fileUrl,
      size: req.file.size,
      uploadedAt: new Date()
    };
  } else {
    throw new AppError('Please provide a document to upload', 400);
  }
   
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
   
  user.kycStatus = 'pending';
  user.kycDocument = kycDocumentData;
  user.kycDocuments = {
    aadharCard: { url: kycDocumentData.url }
  };
   
  const kycUploadNotification = {
    message: "KYC document uploaded successfully. Waiting for verification.",
    time: new Date(),
    from: "System",
    isRead: false,
    type: "verification"
  };
  
  user.notifications = user.notifications || [];
  user.notifications.push(kycUploadNotification);
   
  const updatedUser = await user.save();
   
  const completionDetails = calculateProfileCompletion(updatedUser);
  await User.findByIdAndUpdate(userId, {
    profileCompletion: completionDetails.completionPercentage,
    profileCompletionDetails: completionDetails.completionDetails,
    profile_completed: completionDetails.completionPercentage === 100
  });
  
  res.status(200).json({
    status: 'success',
    message: 'KYC document uploaded successfully',
    data: {
      kycStatus: updatedUser.kycStatus,
      kycDocument: updatedUser.kycDocument
    }
  });
});

 
exports.updateKycDocumentFromSupabase = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  if (!req.body.documentUrl) {
    throw new AppError('Please provide a documentUrl', 400);
  }
  
  const documentUrl = req.body.documentUrl;
  const fileName = req.body.fileName || `${userId}.jpg`;
  const filePath = req.body.filePath || `users_kyc/${fileName}`;
  
 
  const kycDocumentData = {
    filename: fileName,
    originalName: req.body.originalName || fileName,
    mimetype: req.body.mimetype || 'image/jpeg',
    path: filePath,
    url: documentUrl,
    size: req.body.size || 0,
    uploadedAt: new Date()
  };
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
 
  user.kycStatus = 'pending';
  user.kycDocument = kycDocumentData;
  user.kycDocuments = {
    ...(user.kycDocuments || {}),
    aadharCard: { url: documentUrl }
  };
  
  await user.save();
  
 
  const updatedUser = await User.findById(userId);
 
  const completionDetails = calculateProfileCompletion(updatedUser);
  updatedUser.profileCompletion = completionDetails.completionPercentage;
  updatedUser.profileCompletionDetails = completionDetails.completionDetails;
  updatedUser.profile_completed = completionDetails.completionPercentage === 100;
  
  await updatedUser.save();
  
  res.status(200).json({
    status: 'success',
    message: 'KYC document updated successfully from Supabase',
    data: {
      kycStatus: updatedUser.kycStatus,
      kycDocument: updatedUser.kycDocument,
      kycDocuments: updatedUser.kycDocuments
    }
  });
});

 
exports.updateKycStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { status, reason } = req.body;
 
  if (!['pending', 'completed', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be pending, completed, or rejected', 400);
  }
  
 
  if (status === 'rejected' && !reason) {
    throw new AppError('Reason is required when rejecting KYC verification', 400);
  }
  

  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
   
  user.kycStatus = status;
   
  if (status === 'completed') {
    if (user.kycDocument) {
      user.kycDocument.verifiedAt = new Date();
      user.kycDocument.verifiedBy = req.user._id;
    }
     
    const completionDetails = calculateProfileCompletion(user);
    user.profileCompletion = completionDetails.completionPercentage;
    user.profileCompletionDetails = completionDetails.completionDetails;
    user.profile_completed = completionDetails.completionPercentage === 100;
  }
  
  await user.save();
  
  res.status(200).json({
    status: 'success',
    message: `KYC status updated to ${status}`,
    data: {
      userId: userId,
      kycStatus: status
    }
  });
});

 
exports.getPendingKycVerifications = catchAsync(async (req, res) => {
  const pendingVerifications = await User.find({ kycStatus: 'pending' })
    .select('id name email kycStatus kycDocument')
    .sort({ 'kycDocument.uploadedAt': -1 });
  
  res.status(200).json({
    status: 'success',
    count: pendingVerifications.length,
    data: pendingVerifications
  });
});
 
exports.uploadProfilePicture = catchAsync(async (req, res) => {
  const userId = req.user._id;
   
  let profilePictureData = {};
  
  if (req.body.profilePicture && req.body.profilePicture.url) {
 
    profilePictureData = {
      ...req.body.profilePicture,
      uploadedAt: new Date()
    };
  } else if (req.file) { 
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = req.file.path.replace(/\\/g, '/').replace('backend/', '');
    const imageUrl = `${baseUrl}/${relativePath}`;
    
    profilePictureData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
      url: imageUrl,
      size: req.file.size,
      uploadedAt: new Date()
    };
  } else {
    throw new AppError('Please provide an image to upload', 400);
  }
  
 
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
 
  user.profilePicture = profilePictureData;
  
  await user.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Profile picture uploaded successfully',
    data: {
      profilePicture: user.profilePicture
    }
  });
});

 
function determineUpdateType(updateFields) {
  if (updateFields.name || updateFields.dateOfBirth || updateFields.gender || updateFields.bloodType) {
    return 'profile';
  } else if (updateFields.medicalInfo || Object.keys(updateFields).some(key => key.startsWith('medicalInfo.'))) {
    return 'medical';
  } else if (updateFields.phone || updateFields.address || Object.keys(updateFields).some(key => key.startsWith('address.'))) {
    return 'contact';
  } else {
    return 'other';
  }
}

 
function calculateProfileCompletion(user) {
  let completedSections = 0;
  let totalSections = 4;  
 
  const basicInfoComplete = Boolean(user.name && user.dateOfBirth && user.gender && user.bloodType);
  
 
  const contactInfoComplete = Boolean(user.phone && 
    user.address?.street && 
    user.address?.city && 
    user.address?.state && 
    user.address?.postalCode);
  
 
  const medicalInfoComplete = Boolean(user.medicalInfo?.weight && user.medicalInfo?.height);
  
 
  const kycComplete = user.kycStatus === 'completed';
  
 
  if (basicInfoComplete) completedSections++;
  if (contactInfoComplete) completedSections++;
  if (medicalInfoComplete) completedSections++;
  if (kycComplete) completedSections++;
  
  const completionPercentage = Math.round((completedSections / totalSections) * 100);
  
   
  return {
    completionPercentage,
    completionDetails: {
      basicInfo: Boolean(basicInfoComplete),
      contactInfo: Boolean(contactInfoComplete),
      medicalInfo: Boolean(medicalInfoComplete),
      kycVerification: Boolean(kycComplete)
    }
  };
}
