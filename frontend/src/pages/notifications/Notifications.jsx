import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../data/notifications';

const NotificationCard = ({ notification, onMarkAsRead }) => {
  // Determine background and icon based on notification type
  const getTypeStyles = (type) => {
    switch (type) {
      case 'verification':
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'success':
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'reminder':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'welcome':
        return {
          bgColor: 'bg-indigo-50 border-indigo-200',
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          )
        };
      case 'urgent':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'approval':
        return {
          bgColor: 'bg-emerald-50 border-emerald-200',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'appreciation':
        return {
          bgColor: 'bg-pink-50 border-pink-200',
          iconBg: 'bg-pink-100',
          iconColor: 'text-pink-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'event':
        return {
          bgColor: 'bg-purple-50 border-purple-200',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          bgColor: 'bg-gray-50 border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          )
        };
    }
  };

  const { bgColor, iconBg, iconColor, icon } = getTypeStyles(notification.type);

  return (
    <div className={`mb-4 rounded-lg border ${bgColor} p-3 md:p-4 shadow-sm transition-all hover:shadow-md ${notification.isRead ? 'opacity-75' : 'opacity-100'}`}>
      <div className="flex items-start">
        <div className={`mr-3 md:mr-4 flex-shrink-0 rounded-full ${iconBg} p-1.5 md:p-2`}>
          <div className={`${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between">
            <p className={`font-medium text-sm md:text-base ${notification.isRead ? 'text-gray-600' : 'text-gray-900'} break-words`}>
              {notification.message}
            </p>
            {!notification.isRead && (
              <span className="ml-2 flex-shrink-0">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center">
              <span className={`text-xs ${notification.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                {notification.time} • From {notification.from}
              </span>
            </div>
            {!notification.isRead && (
              <button 
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

const Notifications = () => {
  const [notificationList, setNotificationList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const unreadCount = notificationList.filter(n => !n.isRead).length;
  
  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    const getNotifications = async () => {
      if (!currentUser) {
        setLoading(false);
        setNotificationList([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data } = await fetchNotifications();
        // Sort notifications by time in descending order (newest first)
        const sortedNotifications = [...data].sort((a, b) => {
          // Convert time to timestamp if not already
          const timeA = a.originalTime ? new Date(a.originalTime).getTime() : 
                        (typeof a.time === 'string' ? Date.parse(a.time) : new Date().getTime());
          const timeB = b.originalTime ? new Date(b.originalTime).getTime() : 
                        (typeof b.time === 'string' ? Date.parse(b.time) : new Date().getTime());
          
          // Sort in descending order (newest first)
          return timeB - timeA;
        });
        
        setNotificationList(sortedNotifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Failed to fetch notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    getNotifications();
  }, [currentUser]);
  
  const markAsRead = async (id) => {
    try {
      const success = await markNotificationAsRead(id);
      
      if (success) {
        setNotificationList(prevList => 
          prevList.map(notification => 
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        setNotificationList(prevList => 
          prevList.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notificationList 
    : filter === 'unread'
      ? notificationList.filter(n => !n.isRead)
      : notificationList.filter(n => n.from === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pt-16 md:pt-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-600">
              {unreadCount} unread notifications
            </p>
          </div>
          <div className="flex">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || loading}
              className={`rounded-md px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium transition-colors w-full sm:w-auto ${
                unreadCount === 0 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Mark all as read
            </button>
          </div>
        </div>

        <div className="mb-4 md:mb-6 flex overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                filter === 'unread' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              Unread
            </button>
            <button 
              onClick={() => setFilter('System')}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                filter === 'System' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              System
            </button>
            <button 
              onClick={() => setFilter('Staff')}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                filter === 'Staff' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              Staff
            </button>
            <button 
              onClick={() => setFilter('Admin')}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                filter === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Not logged in message */}
        {!currentUser && !loading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Please log in to view your notifications.</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications list */}
        {!loading && !error && currentUser && (
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            ) : (
              <div className="flex h-32 md:h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-4 md:p-6 text-center">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-500">No notifications found</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
