import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AIProvider } from '../pages/support/AIProvider';
import ChatBot from '../pages/support/ChatBot';
import { motion, AnimatePresence } from 'framer-motion';

const WebsiteChatInterface = ({ userId = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnSupportPage, setIsOnSupportPage] = useState(false);
  
  // Check if user is on the support page
  useEffect(() => {
    setIsOnSupportPage(location.pathname === '/support');
  }, [location]);

  // Handle chat toggle
  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      // Check if we need a new conversation
      const chatbotSessionId = localStorage.getItem('chatbotSessionId');
      const sessionTimestamp = localStorage.getItem('chatbotSessionTimestamp');
      
      // If there's no session ID or the session is older than 24 hours, create a new session ID
      const isNewSession = !chatbotSessionId || 
        !sessionTimestamp || 
        (Date.now() - parseInt(sessionTimestamp) > 24 * 60 * 60 * 1000);
        
      if (isNewSession) {
        localStorage.setItem('chatbotSessionId', `session_${Date.now()}`);
        localStorage.setItem('chatbotSessionTimestamp', Date.now().toString());
        // The AIProvider will create a new conversation when it detects this session ID change
      }
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Handle minimize
  const handleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(true);
    setIsExpanded(false);
  };

  // Handle redirect to full support page
  const openFullSupport = (e) => {
    e.stopPropagation();
    navigate('/support');
  };

  // Escape key handler to minimize
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !isMinimized) {
        setIsMinimized(true);
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isMinimized]);

  return (
    <div className="fixed bottom-5 scale-[0.95] right-5 z-50">
      {/* Minimized chat button */}
      {isMinimized && (
        <motion.button
          onClick={toggleChat}
          className="bg-[#248CC4] text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-[#1a6b9a] transition-colors"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </motion.button>
      )}

      {/* Chat interface */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Chat window controls - positioned higher up */}
            <div className="absolute -top-12 right-0 p-2 z-10 flex gap-2 mt-1">
              <button
                onClick={handleMinimize}
                className="bg-gray-300  hover:bg-gray-200 text-gray-700 p-1.5 rounded-full transition-colors"
                title="Minimize"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                </svg>
              </button>
              <button
                onClick={toggleChat}
                className="bg-gray-300  hover:bg-gray-200 text-gray-700 p-1.5 rounded-full transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 14.5V19.5M15 14.5H19.5M9 14.5H4.5M9 14.5V19.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={openFullSupport}
                className="bg-gray-300  hover:bg-gray-200 text-gray-700 p-1.5 rounded-full transition-colors"
                title="Open full support page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </button>
              
              {/* Close button - only shown if not on the support page */}
              {!isOnSupportPage && (
                <button
                  onClick={handleMinimize}
                  className="bg-gray-300 hover:bg-gray-200 text-gray-700 p-1.5 rounded-full transition-colors"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Chat component */}
            <div className={`transition-all duration-300 ${isExpanded ? 'scale-110' : 'scale-100'}`}>
              <AIProvider userId={userId}>
                <ChatBot />
              </AIProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebsiteChatInterface;
