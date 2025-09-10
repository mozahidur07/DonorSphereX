const Donation = require('../../models/Donation');
const User = require('../../models/User');
const AppError = require('../../utils/appError');

exports.getAllDonations = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    

    const filterObj = {};
    
    if (req.query.donationType) filterObj.donationType = req.query.donationType;
    if (req.query.status) filterObj.status = req.query.status;
    if (req.query.bloodType) filterObj.bloodType = req.query.bloodType;
    
    // Search by ID
    if (req.query.donationId) filterObj.donationId = req.query.donationId;
    
    // Search by userId
    if (req.query.userId) filterObj.userId = req.query.userId;
    
    // Search by userEmail
    if (req.query.userEmail) filterObj.userEmail = { $regex: new RegExp(req.query.userEmail, 'i') };
    

    if (req.query.startDate || req.query.endDate) {
      filterObj.date = {};
      if (req.query.startDate) filterObj.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filterObj.date.$lte = new Date(req.query.endDate);
    }

    const totalCount = await Donation.countDocuments(filterObj);
    
    const donations = await Donation.find(filterObj)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      results: donations.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: donations
    });
  } catch (err) {
    return next(new AppError(`Error fetching donations: ${err.message}`, 500));
  }
};

exports.getUserDonations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
  
    const filterObj = { userId: userId };
    
    if (req.query.donationType) filterObj.donationType = req.query.donationType;
    if (req.query.status) filterObj.status = req.query.status;
    
 
    const donations = await Donation.find(filterObj).sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      results: donations.length,
      data: donations
    });
  } catch (err) {
    return next(new AppError(`Error fetching user donations: ${err.message}`, 500));
  }
};

exports.getUserDonationsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    let filterObj = { userId: userId };
    
    if (req.query.donationType) filterObj.donationType = req.query.donationType;
    if (req.query.status) filterObj.status = req.query.status;
    
    let donations = await Donation.find(filterObj).sort({ date: -1 });
    
    if (donations.length === 0) {
      try {
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
          const User = require('../../models/User');
          const user = await User.findById(userId);
          
          if (user) {
            filterObj = { userId: user.userId };
            if (req.query.donationType) filterObj.donationType = req.query.donationType;
            if (req.query.status) filterObj.status = req.query.status;
            donations = await Donation.find(filterObj).sort({ date: -1 });
          }
        }
      } catch (error) {
        console.log('Invalid ObjectId or user not found:', error.message);
      }
    }
    
    res.status(200).json({
      status: 'success',
      results: donations.length,
      data: donations
    });
  } catch (err) {
    return next(new AppError(`Error fetching user donations: ${err.message}`, 500));
  }
};

exports.getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({ donationId: req.params.id });
    
    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }
    
    const isAdmin = req.user.role.admin;
    const isStaff = req.user.role.staff;
    const isOwner = donation.userId === req.user.userId;
    
    if (!isAdmin && !isStaff && !isOwner) {
      return next(new AppError('You do not have permission to view this donation', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: donation
    });
  } catch (err) {
    return next(new AppError(`Error fetching donation: ${err.message}`, 500));
  }
};

exports.createDonation = async (req, res, next) => {
  try {
    const authenticatedUserId = req.user.userId;
    const authenticatedUser = req.user;
    
    req.body.userId = authenticatedUserId;
    
    if (!req.body.userName) {
      req.body.userName = authenticatedUser.name || authenticatedUser.fullName;
    }
    
    if (!req.body.userEmail) {
      req.body.userEmail = authenticatedUser.email;
    }
    
    if (!req.body.donationId) {
      const prefix = req.body.donationType === 'Blood' ? 'BD-' : 
                    (req.body.donationType === 'Organ' ? 'OD-' : 'DN-');
      const randomNum = Math.floor(1000000 + Math.random() * 9000000);
      req.body.donationId = `${prefix}${randomNum}`;
    }
    

    const existingDonation = await Donation.findOne({ donationId: req.body.donationId });
    if (existingDonation) {

      const prefix = req.body.donationType === 'Blood' ? 'BD-' : 
                    (req.body.donationType === 'Organ' ? 'OD-' : 'DN-');
      const randomNum = Math.floor(1000000 + Math.random() * 9000000);
      req.body.donationId = `${prefix}${randomNum}`;
    }
    
    console.log('Creating donation with data:', JSON.stringify(req.body, null, 2));
    

    const newDonation = await Donation.create(req.body);
    console.log('Donation created successfully:', newDonation.donationId);
    

    const donationHistoryEntry = {
      donationId: newDonation.donationId,
      type: newDonation.donationType,
      subType: newDonation.donationSubType || '',
      date: newDonation.date || new Date(),
      hospital: newDonation.preferredHospital || newDonation.location || '',
      status: 'pending',
      statusDate: new Date()
    };
    
    console.log('Adding donation to user history:', JSON.stringify(donationHistoryEntry, null, 2));
    console.log('For user with ID:', authenticatedUserId);
    
    try {

      const user = await User.findOne({ userId: authenticatedUserId });
      
      if (!user) {
        console.error('User not found with userId:', authenticatedUserId);
        throw new Error(`User not found with userId: ${authenticatedUserId}`);
      }
      
   
      if (!user.donationHistory) {
        user.donationHistory = [];
      }
      
      user.donationHistory.push(donationHistoryEntry);
      await user.save();
      
      console.log('Updated user donation history successfully');
      console.log('User now has', user.donationHistory.length, 'donations in history');
      
    } catch (err) {
      console.error('Error updating user donation history:', err);
      console.error('Error details:', err.stack);
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Donation created successfully',
      data: newDonation
    });
  } catch (err) {
    console.error('Error in createDonation:', err);
    return next(new AppError(`Error creating donation: ${err.message}`, 400));
  }
};

exports.updateDonationStatus = async (req, res, next) => {
  try {
    const { status, statusNotes } = req.body;
  
    const validStatuses = ['pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const donation = await Donation.findOne({ donationId: req.params.id });
    
    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }
    

    donation.status = status;
    if (statusNotes) donation.statusNotes = statusNotes;
    await donation.save();
    
    console.log('Donation status updated successfully:', {
      donationId: donation.donationId,
      userId: donation.userId,
      status: status
    });
    
    // Send notification to the user about donation status change
    try {
      const notificationUtils = require('../../utils/notificationUtils');

      const notificationData = notificationUtils.createDonationStatusNotification(
        status, 
        donation.donationId, 
        donation.donationType,
        statusNotes
      );
      if (req.user && req.user.userId) {
        await notificationUtils.addStaffNotification(
          donation.userId, 
          notificationData, 
          req.user
        );
        
        console.log(`Donation status change notification sent to user ${donation.userId} from staff ${req.user.userId}`);
      } else {
        const systemUser = {
          userId: 'system',
          name: 'System',
          fullName: 'System',
          email: 'system@donorsphere.com'
        };
        await notificationUtils.addStaffNotification(donation.userId, notificationData, systemUser);
        console.log(`Donation status change notification sent to user ${donation.userId} from system`);
      }
    } catch (notifError) {
      console.error('Error sending donation status notification:', notifError);
    }
    
    try {
      console.log('Updating donation status in user history for:', {
        userId: donation.userId,
        donationId: donation.donationId,
        newStatus: status
      });
      
      const user = await User.findOne({ userId: donation.userId });
      
      if (!user) {
        console.error('User not found with userId:', donation.userId);
        throw new Error(`User not found with userId: ${donation.userId}`);
      }
      
      const donationIndex = user.donationHistory.findIndex(
        item => item.donationId === donation.donationId
      );
      
      if (donationIndex === -1) {
        console.error('Donation not found in user history:', donation.donationId);
        
        user.donationHistory.push({
          donationId: donation.donationId,
          type: donation.donationType,
          subType: donation.donationSubType || '',
          date: donation.date || donation.createdAt,
          hospital: donation.preferredHospital || donation.location || '',
          status: status,
          statusDate: new Date()
        });
        
        console.log('Added missing donation to user history');
      } else {
        user.donationHistory[donationIndex].status = status;
        user.donationHistory[donationIndex].statusDate = new Date();
        console.log('Updated existing donation in user history');
      }
      
      await user.save();
      console.log('User donation history updated successfully');
      
    } catch (err) {
      console.error('Error updating user donation history status:', err);
      console.error('Error details:', err.stack);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Donation status updated successfully',
      data: donation
    });
  } catch (err) {
    console.error('Error in updateDonationStatus:', err);
    return next(new AppError(`Error updating donation status: ${err.message}`, 500));
  }
};

exports.deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findOneAndDelete({ donationId: req.params.id });
    
    if (!donation) {
      return next(new AppError('Donation not found', 404));
    }
    
    console.log('Donation deleted successfully:', donation.donationId);
    console.log('Now removing from user history for userId:', donation.userId);
    
    try {
      const user = await User.findOne({ userId: donation.userId });
      
      if (!user) {
        console.error('User not found with userId:', donation.userId);
      } else {
        user.donationHistory = user.donationHistory.filter(
          item => item.donationId !== donation.donationId
        );
        
        await user.save();
        console.log('Donation removed from user history successfully');
      }
    } catch (err) {
      console.error(`Error removing donation from user history: ${err.message}`);
      console.error('Error details:', err.stack);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Donation deleted successfully'
    });
  } catch (err) {
    console.error('Error in deleteDonation:', err);
    return next(new AppError(`Error deleting donation: ${err.message}`, 500));
  }
};

exports.getDonationStats = async (req, res, next) => {
  try {
    const typeStats = await Donation.aggregate([
      {
        $group: {
          _id: '$donationType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = await Donation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const bloodTypeStats = await Donation.aggregate([
      {
        $match: { donationType: 'Blood' }
      },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Donation.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        byType: typeStats,
        byStatus: statusStats,
        byBloodType: bloodTypeStats,
        byMonth: monthlyStats
      }
    });
  } catch (err) {
    return next(new AppError(`Error getting donation statistics: ${err.message}`, 500));
  }
};
