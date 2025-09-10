import { useState, useEffect, useRef } from 'react';
import { useAI } from './AIProvider';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';
import { useLocation } from "react-router-dom";

const ChatBot = () => {
  const {
    isLoading,
    error,
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    chatMenu,
    setChatMenu,
    sendMessage,
    startNewConversation,
    deleteConversation,
    useOpenRouter
  } = useAI();
  
  // When component mounts, switch to the chat menu if we have a currentConversationId
  useEffect(() => {
    if (currentConversationId && conversations.some(c => c.id === currentConversationId)) {
      setChatMenu('chat');
    }
  }, []);

  const location = useLocation();
  const [subPath, setSubPath] = useState("");
   useEffect(() => {
    // location.pathname = "/user/123/profile"
    // split করে userid এর পরের অংশ বের করছি
    const parts = location.pathname.split("/");
    // parts = ["", "user", "123", "profile"]
    if (parts.length > 3) {
      setSubPath(parts[3]); // এখানে subpath = "profile"
    }
    console.log("Subpath:", subPath);
    
  }, [location]);



  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  
  // Log when the current conversation changes for debugging
  useEffect(() => {
    console.log('Current conversation changed to:', currentConversationId);
  }, [currentConversationId]);
  
  // Initialize conversation handling
  useEffect(() => {
    const initConversation = async () => {
      const lastActiveConversationId = localStorage.getItem('lastActiveConversationId');
      
      // Check if there's a saved conversation that we need to load
      if (lastActiveConversationId && conversations.length > 0) {
        // Check if the last active conversation still exists
        const conversationExists = conversations.some(conv => conv.id === lastActiveConversationId);
        
        if (conversationExists) {
          setCurrentConversationId(lastActiveConversationId);
          setChatMenu('chat'); // Make sure we switch to chat view
        } else if (conversations.length > 0) {
          // If the saved conversation doesn't exist, use the most recent one
          setCurrentConversationId(conversations[0].id);
        } else {
          // Create a new conversation if we don't have any
          await startNewConversation();
        }
      } else if (conversations.length === 0) {
        // If we don't have any conversations, create a new one
        await startNewConversation();
      } else if (!currentConversationId && conversations.length > 0) {
        // Use the most recent conversation if we don't have a current one
        setCurrentConversationId(conversations[0].id);
      }
    };
    
    // Only run this if we don't have a current conversation ID or we have a lastActiveConversationId
    if (!currentConversationId || localStorage.getItem('lastActiveConversationId')) {
      // Add a small delay to ensure database connection is ready
      const timeoutId = setTimeout(() => {
        initConversation();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentConversationId, conversations, startNewConversation, setCurrentConversationId, setChatMenu]);

  // Scroll to bottom of messages whenever messages change or when loading completes
  useEffect(() => {
    // Use a small timeout to ensure DOM has updated
    const scrollTimer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    return () => clearTimeout(scrollTimer);
  }, [currentConversation, isLoading]);
  
  // Also scroll down when user clicks a suggested question or menu changes to chat
  useEffect(() => {
    if (chatMenu === 'chat') {
      const scrollTimer = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [chatMenu]);

  const [sendButtonAnimation, setSendButtonAnimation] = useState(false);

  const animateIcon = (iconId) => {
    // Get the icon element
    const iconElement = document.getElementById(iconId);
    if (!iconElement) return;
    
    // Prevent multiple animations from running simultaneously
    if (iconElement.classList.contains('animation-send') || 
        iconElement.classList.contains('animation-return')) {
      return;
    }
    
    // Add animation class to start the animation
    iconElement.classList.add('animation-send');
    
    // Use requestAnimationFrame for smoother animation timing
    requestAnimationFrame(() => {
      // After the animation completes
      setTimeout(() => {
        // Remove the send animation
        iconElement.classList.remove('animation-send');
        
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
          // Add the return animation
          iconElement.classList.add('animation-return');
          
          // Remove return animation after it completes
          setTimeout(() => {
            iconElement.classList.remove('animation-return');
          }, 500);
        });
      }, 2000);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    // Trigger the animation for send icon
    animateIcon('send-icon');
    
    sendMessage(inputMessage, currentConversationId);
    setInputMessage('');
  };

  const handleSuggestedQuestion = (question) => {
    // Simply send the message - we've fixed the order issue in sendMessage function
    sendMessage(question, currentConversationId);
    
    // Scroll to bottom after clicking a suggested question
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseAIResponse = (content) => {
    try {
      // Try simple parsing first
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      
      // If parsing fails, return a fallback object
      return {
        answer: content.substring(0, 1500), // Limit to reasonable size
        suggestedQuestions: [
          "How can I donate blood?", 
          "What are the eligibility requirements?",
          "How do I request blood?"
        ]
      };
    }
  };

  const renderMessages = () => {
    if (!currentConversation) {
      console.warn('No current conversation found. ID:', currentConversationId);
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center p-4">
            <p className="mb-2">No conversation selected</p>
            <button
              onClick={() => startNewConversation()}
              className="text-sm bg-[#248CC4] text-white py-1.5 px-3 rounded hover:bg-[#1a6b9a]"
            >
              Start a new conversation
            </button>
          </div>
        </div>
      );
    }
    
    return currentConversation.messages
      .filter(m => m.role !== 'system')
      .map((message, index) => {
        if (message.role === 'user') {
          return (
            <div key={index} className="flex justify-end mb-4">
              <div className="user-message-bubble bg-[#248CC4] text-white py-2 sm:py-3 px-3 sm:px-4 max-w-[90%] sm:max-w-[80%] shadow-sm">
                <p className="text-sm break-words">{message.content}</p>
                <p className="text-xs text-blue-100 text-right mt-1 opacity-75">
                  {formatDate(message.time || new Date())}
                </p>
              </div>
            </div>
          );
        } else {
          const parsedResponse = parseAIResponse(message.content);
          return (
            <div key={index} className="mb-4">
              <div className="flex items-start gap-2">
                <div className="assistant-message-bubble bg-white py-2 sm:py-3 px-3 sm:px-4 max-w-[90%] sm:max-w-[80%] shadow-sm">
                  <div className="text-gray-800 markdown-content text-sm sm:text-base">
                    <ReactMarkdown>
                      {typeof parsedResponse.answer === 'string' 
                        ? parsedResponse.answer 
                        : "I'm experiencing some technical difficulties processing your request. Please try again."}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formatDate(message.time || new Date())}
                    </p>
                            {useOpenRouter && (
                      <span className="fallback-indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Fallback API
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {parsedResponse.suggestedQuestions && Array.isArray(parsedResponse.suggestedQuestions) && parsedResponse.suggestedQuestions.length > 0 && (
                <div className="mt-3 ml-2">
                  <div className="flex flex-wrap gap-2">
                    {parsedResponse.suggestedQuestions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-xs sm:text-sm suggested-question py-1.5 sm:py-2 px-3 sm:px-4 text-left shadow-sm"
                      >
                        {typeof question === 'string' ? question : "How can I help you?"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
      });
  };

  const renderChatHome = () => {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-[#248CC4]">Welcome to DonorSphereX Support</h2>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-medium text-lg mb-2 text-gray-700 border-b pb-2">Quick Links</h3>
            <ul className="space-y-2 pt-1">
              <li><a href="/donation/blood" className="text-[#248CC4] hover:underline flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> Blood Donation
              </a></li>
              <li><a href="/donation/organ" className="text-[#248CC4] hover:underline flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> Organ Donation
              </a></li>
              <li><a href="/requests/blood" className="text-[#248CC4] hover:underline flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> Request Blood
              </a></li>
              <li><a href="/profile" className="text-[#248CC4] hover:underline flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> My Profile
              </a></li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-medium text-lg mb-2 text-gray-700 border-b pb-2">Common Questions</h3>
            <ul className="space-y-2 pt-1">
              <li>
                <button 
                  onClick={() => {
                    setChatMenu('chat');
                    handleSuggestedQuestion('How do I donate blood?');
                  }}
                  className="text-[#248CC4] hover:underline text-left w-full flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> How do I donate blood?
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setChatMenu('chat');
                    handleSuggestedQuestion('What are the eligibility requirements?');
                  }}
                  className="text-[#248CC4] hover:underline text-left w-full flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> What are the eligibility requirements?
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setChatMenu('chat');
                    handleSuggestedQuestion('How do I check my donation history?');
                  }}
                  className="text-[#248CC4] hover:underline text-left w-full flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> How do I check my donation history?
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setChatMenu('chat');
                    handleSuggestedQuestion('What should I do after donating?');
                  }}
                  className="text-[#248CC4] hover:underline text-left w-full flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-[#248CC4] rounded-full"></span> What should I do after donating?
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => {
              setChatMenu('chat');
              startNewConversation();
            }}
            className="bg-[#248CC4] text-white py-2 px-6 rounded-lg hover:bg-[#1a6b9a] transition-colors"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  };

  // Generate a meaningful title from conversation content
  const generateConversationTitle = (conversation) => {
    // First try to find first user message
    const firstUserMsg = conversation.messages.find(m => m.role === 'user');
    
    if (firstUserMsg) {
      // Try to extract key topic from the message
      const content = firstUserMsg.content.toLowerCase();
      
      // Check for common topics
      if (content.includes('donate blood') || content.includes('blood donation')) {
        return "Blood Donation Discussion";
      } else if (content.includes('organ') || content.includes('transplant')) {
        return "Organ Donation Query";
      } else if (content.includes('eligib')) {
        return "Eligibility Requirements";
      } else if (content.includes('appointment') || content.includes('schedule')) {
        return "Appointment Scheduling";
      } else if (content.includes('history') || content.includes('past donation')) {
        return "Donation History";
      } else if (content.includes('after donating') || content.includes('post donation')) {
        return "Post-Donation Care";
      } else if (content.includes('profile') || content.includes('account')) {
        return "Account Management";
      }
      
      // If no topic detected, use truncated message
      return content.length > 25 ? content.substring(0, 25) + '...' : content;
    }
    
    // Fallback to date-based title
    const date = new Date(conversation.createdAt);
    return `Conversation on ${date.toLocaleDateString()}`;
  };

  const renderChatHistory = () => {
    if (conversations.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 h-full flex flex-col justify-center items-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="mb-2">No conversation history yet.</p>
          <p className="text-sm text-gray-400 mb-4">Start a new chat to get help with blood donation.</p>
          <button
            onClick={() => {
              setChatMenu('chat');
              startNewConversation();
            }}
            className="mt-2 bg-[#248CC4] text-white py-2 px-6 rounded-lg hover:bg-[#1a6b9a] transition-colors"
          >
            Start New Chat
          </button>
        </div>
      );
    }

    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-[#248CC4]">Conversation History</h2>
        <div className="space-y-3">
          {conversations.map(conversation => {
            const title = generateConversationTitle(conversation);
            const messageCount = conversation.messages.filter(m => m.role !== 'system').length;
              
            return (
              <div 
                key={conversation.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                <div 
                  className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Switching to conversation:", conversation.id);
                    setCurrentConversationId(conversation.id);
                    setTimeout(() => {
                      setChatMenu('chat');
                    }, 100);
                  }}
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#248CC4] rounded-full"></span>
                      <p className="font-medium text-gray-800">{title}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDate(conversation.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {messageCount - 1} messages
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="text-gray-400 hover:text-[#248CC4] bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"
                    aria-label="Delete conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setChatMenu('chat');
              startNewConversation();
            }}
            className="bg-[#248CC4] text-white py-2 px-6 rounded-lg hover:bg-[#1a6b9a] flex items-center justify-center mx-auto gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start New Chat
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] w-full sm:w-[450px] max-w-[95vw] bg-gray-50 border border-gray-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
      {/* Chat Header */}
      <div className="chat-header bg-gradient-to-r from-[#248CC4] to-[#1a6b9a] text-white px-5 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">Donor Assistant</h3>
            <p className="text-[10px] sm:text-xs -mt-[6px] text-white/70">
              {useOpenRouter ? 'DeepSeek R1 (Fallback API)' : 'GPT-4o Mini'} powered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {currentConversation && chatMenu === 'chat' && (
              <button
                onClick={() => {
                  animateIcon('new-chat-icon');
                  setTimeout(() => startNewConversation(), 500);
                }}
                className="header-btn text-white text-xs sm:text-sm bg-white/20 font-medium border border-white/30 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full hover:bg-white/30 transition-colors duration-300 flex items-center gap-1"
                title="New conversation"
              >
                <span className="new-chat-icon-wrapper">
                  <svg 
                    id="new-chat-icon"
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span>New Chat</span>
              </button>
            )}
          </div>
          {/* Only show the close button in the Support page */}
          {location.pathname === '/support' && (
            <button 
              onClick={() => window.closeChatbot && window.closeChatbot()}
              className="header-btn text-white text-xs sm:text-sm bg-white/20 font-medium border border-white/30 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full hover:bg-white/30 transition-colors duration-300 flex items-center gap-1"
            >
              <span>Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* No settings modal anymore */}
      
      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#e8e8e8b3] messages-container">
        {chatMenu === 'home' && renderChatHome()}
        {chatMenu === 'chat' && (
          <>
            {isLoading && conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#248CC4]"></div>
              </div>
            ) : (
              <div className="flex flex-col min-h-full">
                <div className="flex-1">
                  {renderMessages()}
                </div>
                <div ref={messagesEndRef} className="pt-2" />
                {isLoading && (
                  <div className="flex items-start my-3">
                    <div className="typing-animation assistant-message-bubble bg-white  shadow-sm relative">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {chatMenu === 'history' && renderChatHistory()}
      </div>
      
      {/* Input Area - Only show in chat mode */}
      {chatMenu === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#248CC4]"
              disabled={isLoading}
            />
            <button
              type="submit"
              id="send-button"
              className={` bg-[#248CC4] flex items-center justify-center text-white px-4 py-2 rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a6b9a] cursor-pointer'}`}
              disabled={isLoading || !inputMessage.trim()}
            >
              <span className="send-icon-wrapper">
                <svg 
                  id="send-icon"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className={`w-5 h-5 send-btn ${sendButtonAnimation ? 'animation-send' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </span>
            </button>
          </div>
        </form>
      )}


      {/* Bottom Navigation */}
      <div className="flex border-t bg-white">
        <button
          onClick={() => setChatMenu('home')}
          className={`flex-1 py-3 flex justify-center items-center ${chatMenu === 'home' ? 'text-[#248CC4] border-t-2 border-[#248CC4]' : 'text-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </button>
        <button
          onClick={() => setChatMenu('chat')}
          className={`flex-1 py-3 flex justify-center items-center ${chatMenu === 'chat' ? 'text-[#248CC4] border-t-2 border-[#248CC4]' : 'text-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </button>
        <button
          onClick={() => setChatMenu('history')}
          className={`flex-1 py-3 flex justify-center items-center ${chatMenu === 'history' ? 'text-[#248CC4] border-t-2 border-[#248CC4]' : 'text-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
