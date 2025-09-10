const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

 
router.get('/', authMiddleware.protect, async (req, res) => {
  try {
    const userId = req.user._id;
     
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    } 

    const notifications = user.notifications || [];
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
     
    const formattedNotifications = notifications.map(notification => {
      const notificationTime = new Date(notification.time);
      const currentTime = new Date();
       
      const diffMs = currentTime - notificationTime;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);
       
      let timeString;
      const diffSeconds = Math.floor(diffMs / 1000);
      
      if (diffSeconds < 60) {
        timeString = `${diffSeconds} ${diffSeconds === 1 ? 'second' : 'seconds'} ago`;
      } else if (diffMinutes < 60) {
        timeString = `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffHours < 24) {
        timeString = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffDays < 30) {
        timeString = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      } else if (diffMonths < 12) {
        timeString = `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
      } else {
        timeString = `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
      }
      
      return {
        ...notification.toObject(),
        time: timeString,
        originalTime: notification.time
      };
    });
    
    res.status(200).json({
      status: 'success',
      count: formattedNotifications.length,
      unreadCount: formattedNotifications.filter(n => !n.isRead).length,
      data: formattedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});
 
router.patch('/mark-all-read', authMiddleware.protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
   
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
     
    if (user.notifications && user.notifications.length > 0) { 
      user.notifications = user.notifications.map(notification => { 
        const notifObj = notification.toObject ? notification.toObject() : {...notification};
        notifObj.isRead = true;
        return notifObj;
      });
    }
     
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notifications',
      error: error.message
    });
  }
});

 
router.patch('/:notificationId', authMiddleware.protect, async (req, res) => {
  try {
    const userId = req.user._id;
     
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
     
    if (user.notifications && user.notifications.length > 0) {
      user.notifications = user.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
    }
     
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notifications',
      error: error.message
    });
  }
});

 
router.post('/add', authMiddleware.protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { notification } = req.body;
    
    if (!notification || !notification.message || !notification.type) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification data. Required: message and type'
      });
    }
     
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
     
    const newNotification = {
      id: crypto.randomBytes(8).toString('hex'),
      message: notification.message,
      time: new Date(),
      from: notification.from || 'System',
      isRead: false,
      type: notification.type
    };
     
    user.notifications = user.notifications || [];
    user.notifications.unshift(newNotification);  
  
    await user.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Notification added successfully',
      data: newNotification
    });
  } catch (error) {
    console.error('Error adding notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add notification',
      error: error.message
    });
  }
});

module.exports = router;
