import { createContext, useContext, useState, useEffect } from 'react';
import { useIndexedDB } from './useIndexedDB';
import OpenAI from "openai";
import { websiteStructure } from './WebsiteContext';
import { useAuth } from '../../context/AuthContext';
import useUserStore from '../../store/userStore';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;


const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Website context for AI
const websiteContext = {
  name: "DonorSphereX",
  description: "A blood and organ donation platform that connects donors with recipients",
  routes: {
    home: "/",
    about: "/about",
    bloodDonation: "/donation/blood",
    organDonation: "/donation/organ",
    bloodRequest: "/requests/blood",
    organRequest: "/requests/organ",
    profile: "/profile",
    notifications: "/notifications",
    support: "/support",
    dashboard: "/dashboard",
    donationReports: "/donation/reports",
    termsOfService: "/terms",
    privacyPolicy: "/privacy",
    signIn: "/signin",
    signUp: "/signup",
  },
  features: [
    "Blood donation registration and scheduling",
    "Organ donation registration",
    "Emergency blood requests",
    "Organ transplant requests",
    "Donation history tracking",
    "Medical eligibility checks",
    "Donation center locator",
    "Real-time notifications",
    "Donor-recipient matching",
    "Community support network",
  ],
  faqCategories: [
    "Donation Process",
    "Eligibility",
    "Medical",
    "Post Donation",
    "Account",
    "Technical",
    "Preparation"
  ]
};

const AIContext = createContext();

export const useAI = () => {
  return useContext(AIContext);
};

// Helper function to map OpenAI models to OpenRouter models
const mapToOpenRouterModel = (openaiModel) => {
  // Always use DeepSeek model for fallback to ensure consistent response handling
  return 'deepseek/deepseek-r1:free';
};

// Helper function for OpenRouter fallback model name
const FALLBACK_MODEL_NAME = 'DeepSeek R1 (Fallback API)';

export const AIProvider = ({ children, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatMenu, setChatMenu] = useState('chat'); 
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [aiModel, setAiModel] = useState('gpt-4o-mini'); // Using fixed model
  // Track if we're using OpenRouter due to OpenAI issues
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const { currentUser } = useAuth();
  const userData = useUserStore(state => state.userData);
  

  const [userContext, setUserContext] = useState({
    userId: userId || '',
    donationHistory: [],
    requests: [],
    eligibilityStatus: 'unknown',
    lastDonationDate: null,
    notificationCount: 0,
    accountStatus: 'active',
  });

  const { getItem, setItem, getAllItems, removeItem, isInitialized } = useIndexedDB('chatConversations');

  // Load conversations from IndexedDB on component mount or when database is initialized
  useEffect(() => {
    const loadConversations = async () => {
      try {
        if (!isInitialized) return;
        
        const storedConversations = await getAllItems();
        
        if (storedConversations && storedConversations.length > 0) {
          const sortedConversations = [...storedConversations].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setConversations(sortedConversations);
          
          // Always load the last active conversation ID
          const lastActiveConversationId = localStorage.getItem('lastActiveConversationId');
          
          // Check if the last active conversation exists in our loaded conversations
          const lastConversationExists = lastActiveConversationId && 
            sortedConversations.some(conv => conv.id === lastActiveConversationId);
          
          if (lastConversationExists) {
            // Set to last active conversation
            setCurrentConversationId(lastActiveConversationId);
          } else {
            // If the last conversation doesn't exist, use the most recent one
            setCurrentConversationId(sortedConversations[0].id);
          }
          
          // Update session timestamp
          localStorage.setItem('chatbotSessionId', `session_${Date.now()}`);
          localStorage.setItem('chatbotSessionTimestamp', Date.now().toString());
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError("Failed to load conversation history");
      }
    };
    
    loadConversations();
  }, [getAllItems, isInitialized]);
  
  // Fetch user's requests (blood and organ)
  const fetchUserRequests = async () => {
    if (!currentUser) return [];
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      if (!token) return [];
      
      const userId = currentUser.userId; 
      
      // Add a timestamp to prevent caching issues
      const timestamp = Date.now();
      
      // Try the direct query parameter approach first (which we know works)
      try {
        const response = await fetch(`${API_URL}/requests?userId=${userId}&_=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') { 
            return data.data || [];
          }
        }
      } catch (err) {
        console.error('AIProvider - Error with first request method:', err);
      }
       
      try {
        const response = await fetch(`${API_URL}/requests/user/${userId}?_=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json(); 
          return data.status === 'success' ? data.data : [];
        }
      } catch (fallbackErr) {
        console.error('AIProvider - Error with fallback request method:', fallbackErr);
      }
      
      // Try one more approach - get from /my-requests endpoint
      try { 
        const response = await fetch(`${API_URL}/requests/my-requests?_=${timestamp}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json(); 
          return data.status === 'success' ? data.data : [];
        }
      } catch (secondFallbackErr) {
        console.error('AIProvider - Error with second fallback request method:', secondFallbackErr);
      }
       
      return [];
    } catch (error) {
      console.error('AIProvider - Error fetching user requests:', error);
      return [];
    }
  };
  
  // Fetch user's donation history
  const fetchDonationHistory = async () => {
    if (!currentUser) return [];
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      if (!token) return [];
      
      const response = await fetch(`${API_URL}/donations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'success' ? data.data : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching donation history:', error);
      return [];
    }
  };

  // Update userContext with real data when userData changes
  useEffect(() => {
    const updateUserContext = async () => {
      if (userData) {
        try {
          // Fetch the most up-to-date data from the APIs
          const requests = await fetchUserRequests();
          const donationHistory = await fetchDonationHistory();
          
       
          
          // Sanitize and structure user data for AI context
          const sanitizedUserData = {
            userId: userData.userId ,
            name: userData.name || '',
            email: userData.email || 'Not provided',
            bloodType: userData.bloodType || 'Unknown',
            gender: userData.gender || 'Unknown',
            dateOfBirth: userData.dateOfBirth || null,
            profileCompletionDetails: userData.profileCompletionDetails || {
              basicInfo: false,
              contactInfo: false,
              medicalInfo: false,
              kycVerification: false
            },
            profileCompletion: userData.profileCompletion || 0,
            donationHistory: donationHistory || [], 
         
            requests: requests || [],
            lastDonation: userData.lastDonation || 'Never donated',
            nextEligibleDonation: userData.nextEligibleDonation || 'Unknown',
            accountStatus: userData.status || 'active',
            isLoggedIn: true,
            
           
            medicalInfo: userData.medicalInfo ? {
              height: userData.medicalInfo.height,
              weight: userData.medicalInfo.weight,
              allergies: userData.medicalInfo.allergies,
              conditions: userData.medicalInfo.conditions,
              lastCheckup: userData.medicalInfo.lastCheckup
            } : {},
          };
          
          setUserContext(sanitizedUserData);
        } catch (error) {
          console.error("Error updating user context for AI:", error);
          
 
          const sanitizedUserData = {
            userId: userData.userId ,
            name: userData.name || 'Guest',
            bloodType: userData.bloodType || 'Unknown',
            isLoggedIn: true,
            accountStatus: 'active',
          };
          
          setUserContext(sanitizedUserData);
        }
      } else if (currentUser && !userData) {
        
        try {
          const requests = await fetchUserRequests();
          const donationHistory = await fetchDonationHistory();
          
          setUserContext({
            userId: currentUser.userId || userId ,
            name: currentUser.fullName || 'User',
            isLoggedIn: true,
            accountStatus: 'active',
            requests: requests || [],
            donationHistory: donationHistory || []
          });
        } catch (error) {
          console.error("Error fetching data for logged in user:", error);
          
          setUserContext({
            userId: currentUser.id || userId || '',
            name: currentUser.fullName || '',
            isLoggedIn: true,
            accountStatus: 'active',
          });
        }
      } else {
        setUserContext({
          userId: '',
          isLoggedIn: false,
        });
      }
    };
    
    updateUserContext();
  }, [userData, currentUser, userId]);

  // Generate title based on conversation content
  const generateTitle = (messages) => {

    const userMessages = messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) {
      return "New Conversation";
    }
    
    const firstUserMessage = userMessages[0].content.toLowerCase();
    
 
    if (firstUserMessage.includes('donate blood') || firstUserMessage.includes('blood donation')) {
      return "Blood Donation";
    } else if (firstUserMessage.includes('organ') || firstUserMessage.includes('transplant')) {
      return "Organ Donation";
    } else if (firstUserMessage.includes('eligib')) {
      return "Eligibility Requirements";
    } else if (firstUserMessage.includes('appointment') || firstUserMessage.includes('schedule')) {
      return "Appointment Scheduling";
    } else if (firstUserMessage.includes('history') || firstUserMessage.includes('past donation')) {
      return "Donation History";
    } else if (firstUserMessage.includes('profile') || firstUserMessage.includes('account')) {
      return "Account Information";
    }
    

    const words = firstUserMessage.split(' ');
    const titleWords = words.slice(0, 3).join(' ');
    
    return titleWords.length > 20 
      ? titleWords.substring(0, 20) + '...' 
      : titleWords.charAt(0).toUpperCase() + titleWords.slice(1);
  };

  const startNewConversation = async () => {
    try {
      if (!isInitialized) {
        setError("Database not initialized yet. Please try again.");
        return null;
      }
      

      const uniqueId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const newConversation = {
        id: uniqueId,
        title: "New Conversation",
        createdAt: new Date().toISOString(),

        messages: [{
          role: 'system',
          content: JSON.stringify({
            instructions: `You are a helpful AI assistant for the DonorSphereX blood and organ donation platform. 
            Provide concise, accurate information about blood and organ donation processes. 
            Only answer questions related to blood donation, organ donation, eligibility checks, its risks, what to do next after donation and before donation, the website functionality or guide user to find pages by paths.
            
            IMPORTANT: Check if user is logged in by looking at userContext.isLoggedIn.
            - If user is logged in, you can access their personal data like donation history, blood type, etc. from userContext.
            - If user asks about their specific data like "show my donation history" or "when can I donate next" and they're not logged in, tell them they need to log in or create an account first and direct them to the login page at /signin.
            - For general questions not requiring login, answer regardless of login status.
            - You can share contact info, email and address from websiteContext with any user.
            
            DONATION HISTORY AND REQUESTS:
            - You have access to real-time donation history in userContext.donationHistory
            - You have access to real-time blood and organ requests in userContext.requests
            - These are fetched directly from the APIs, not from the user profile
            
            CHAT HISTORY CONTEXT:
            - You have access to the full conversation history in sessionChatHistory array
            - Each message in sessionChatHistory has: role (user/assistant), content, and timestamp
            - Use the history to maintain context between messages
            - If the user refers to something they mentioned before, look through the history
            - Show continuity in the conversation by referencing previous topics when relevant
            - Avoid repeating information you've already provided unless the user asks for clarification
            
            CRITICAL FOR REQUEST IDENTIFICATION:
            - When user asks for request details, first LIST ALL request IDs you can see in the userContext.requests array
            - The IDs might appear in different formats (requestId, _id, id fields) - check ALL fields
            - Look for exact ID matches first, then try partial matches if needed
            - Make sure you check for ID format variations (with or without dashes, case differences)
            - If you're searching for an ID, log all the IDs you checked to help with debugging
            
            When user asks about a specific donation or request ID:
            1. Look through userContext.donationHistory or userContext.requests array THOROUGHLY
            2. Find the item with matching ID - check ALL possible ID fields: id, _id, donationId, requestId
               - IMPORTANT: Compare IDs case-insensitively, as the same ID may appear in different formats
               - Use includes() or toLowerCase() comparison to find partial matches if needed
            3. Provide all available details about that donation or request
            4. Provide complete details of ALL requests in the user's history if the exact ID can't be found
            
            When user asks for their donation history:
            1. Check userContext.donationHistory
            2. Summarize their donations by type, date, and status
            3. Mention details like location, amount, and any other relevant information
            
            When user asks for their request history:
            1. Check userContext.requests ARRAY CAREFULLY and list EVERY request
            2. Summarize ALL requests by type, date, and status - ENUMERATE EACH ONE INDIVIDUALLY
            3. Always include the REQUEST ID for each request
            4. List the complete details including: 
               - Request ID (requestId field)
               - Type (blood or organ)
               - Status (pending, completed, rejected, etc.)
               - Date created/requested
               - Location/hospital
               - Additional details like blood type, urgency, etc.
            5. ALWAYS mention the TOTAL NUMBER of requests in their history
            6. NEVER omit any requests - the user should see ALL their requests in your response

            When user id and user name is 'guest' or empty, it means the user is not logged in.
            
            When discussing blood types, reference the compatibility information from the websiteContext.
            
            When responding, always return a JSON object in this format:
            {
              "answer": "Your helpful response here",
              "suggestedQuestions": ["Question 1", "Question 2", "Question 3"]
            }`,
            websiteContext: websiteStructure,
            userContext: userContext,
            sessionChatHistory: [] 
          })
        }, {
          role: 'assistant',
          content: JSON.stringify({
            answer: userContext.isLoggedIn 
              ? `Hello ${userContext.name || "Donor"}! I'm your virtual assistant for DonorSphereX. How can I help you with blood or organ donation today?`
              : "Hello! I'm your virtual assistant for DonorSphereX. How can I help you with blood or organ donation today? If you want information about your profile or donation history, please log in first.",
            suggestedQuestions: userContext.isLoggedIn 
              ? [
                  "How can I donate blood?",
                  "What are the eligibility requirements?",
                  "When can I donate blood next?",
                  "Show my donation history"
                ]
              : [
                  "How can I donate blood?",
                  "What are the eligibility requirements?",
                  "How do I request blood?",
                  "Where is the nearest donation center?"
                ]
          }),
          time: new Date().toISOString()
        }]
      };
      
 
      setConversations(prev => {
        const exists = prev.some(c => c.id === newConversation.id);
        if (exists) return prev;
        return [newConversation, ...prev];
      });
      
      setCurrentConversationId(newConversation.id);
      
      await setItem(newConversation);
      
      return newConversation;
    } catch (err) {
      setError("Failed to create new conversation");
      return null;
    }
  };

  const sendMessage = async (message, conversationId) => {
    let conversation;
    let updatedConversation;
    
    if (!isInitialized) {
      setError("Database not initialized yet. Please try again.");
      return;
    }
    
    if (!conversationId) {
      conversation = await startNewConversation();
      if (!conversation) {
        return;
      }
    } else {
      conversation = conversations.find(c => c.id === conversationId);
      
      // If not found in state, try fetching from DB directly
      if (!conversation) {
        try {
          conversation = await getItem(conversationId);
        } catch (err) {
          console.error(`Failed to get conversation ${conversationId}:`, err);
        }
      }
    }
    
    if (!conversation) {
      setError("Conversation not found");
      return;
    }
    
    // Ensure we have a messages array
    const existingMessages = conversation.messages || [];
    
    // Add the new user message
    const updatedMessages = [
      ...existingMessages,
      { 
        role: 'user', 
        content: message, 
        time: new Date().toISOString() 
      }
    ];
    
    // Create updated conversation object
    updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      lastUpdated: new Date().toISOString() // Track last update time
    };
    
    // Update conversation in state first for immediate feedback
    setConversations(prev => 
      prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );
    
    // First save the user message to the database
    try {
      await setItem(updatedConversation);
      
      // Now set loading state AFTER user message appears
      setIsLoading(true);
      setError(null);
      
      // Prepare context for AI
      const systemMessage = updatedConversation.messages.find(m => m.role === 'system');
       
      let systemMessageContent;
      try {
        systemMessageContent = JSON.parse(systemMessage.content);
         
        if (userContext && userContext.requests && userContext.requests.length > 0) {
          
          systemMessageContent.userContext = {
            ...systemMessageContent.userContext,
            requests: userContext.requests
          };
        }
      } catch (err) {
        console.error("Error parsing system message:", err);
        systemMessageContent = { instructions: systemMessage.content };
      }
      
      // Extract chat history for context
      const chatHistoryMessages = updatedConversation.messages
        .filter(m => m.role !== 'system')
        .map(m => {
          if (m.role === 'assistant') {
            let parsedContent;
            try {
              parsedContent = JSON.parse(m.content);
              return {
                role: 'assistant',
                content: parsedContent.answer || m.content,
                time: m.time
              };
            } catch (err) {
              return m;
            }
          }
          return m;
        });
      
      // Format chat history for the AI
      const sessionChatHistory = chatHistoryMessages.map(msg => {
        return {
          role: msg.role,
          content: msg.role === 'assistant' && typeof msg.content === 'object' ? 
            msg.content.answer || JSON.stringify(msg.content) : msg.content,
          timestamp: msg.time
        };
      });
      
      // Update the system message with chat history
      const updatedSystemContent = {
        ...systemMessageContent,
        sessionChatHistory: sessionChatHistory,
        instructions: systemMessageContent.instructions + `
        
        CHAT HISTORY CONTEXT:
        You now have access to the user's previous messages and your responses in this conversation in the sessionChatHistory object.
        Use this to maintain context and provide more personalized responses.
        This helps you understand what the user has already asked and what information you've already provided.
        If the user refers to something mentioned earlier, check the chat history to provide an accurate response.
        Remember that the user might be continuing a thought from a previous message.`
      };
      
      const updatedSystemMessage = {
        ...systemMessage,
        content: JSON.stringify(updatedSystemContent)
      };
      
      const contextMessages = [updatedSystemMessage];
      
      const recentMessages = updatedConversation.messages
        .filter(m => m.role !== 'system')
        .slice(-10);
      
      const messagesToSend = [...contextMessages, ...recentMessages];
      

      try {
        let aiResponse;
        
        try {  
          const openai = new OpenAI({
            apiKey: OPENAI_API_KEY, 
            dangerouslyAllowBrowser: true, 
          });
          
          // Create chat completion with OpenAI
          const completion = await openai.chat.completions.create({
            model: aiModel, // Using the model from state
            messages: messagesToSend.map(m => ({
              role: m.role,
              content: m.content
            })),
            temperature: 0.7,
            max_tokens: 800
          });
           
          aiResponse = completion.choices[0].message.content;
          console.log('OpenAI response successful'); 
          setUseOpenRouter(false);
          
        } catch (openaiError) {
          // If OpenAI fails (rate limit or other error), try OpenRouter as fallback
          console.error('OpenAI API error:', openaiError);
          console.log('Falling back to OpenRouter API...');
          
          // Determine if this is a rate limit error
          const isRateLimitError = 
            openaiError.message?.includes('rate limit') || 
            openaiError.message?.includes('429') || 
            openaiError.message?.includes('quota');
            
          if (!OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API key is missing. Cannot fall back.');
          }
          
          // Send an intermediate message to inform the user we're switching APIs
          if (isRateLimitError) {
            const fallbackNotification = {
              role: 'assistant',
              content: JSON.stringify({
                answer: "I'm currently experiencing high demand on my primary AI service. Switching to my backup system to continue helping you...",
                suggestedQuestions: []
              }),
              time: new Date().toISOString()
            };
            
            // Add this notification to conversation messages
            const messagesWithNotification = [
              ...updatedConversation.messages,
              fallbackNotification
            ];
            
            // Update state with notification message
            const notificationConversation = {
              ...updatedConversation,
              messages: messagesWithNotification
            };
            
            setConversations(prev => 
              prev.map(c => c.id === notificationConversation.id ? notificationConversation : c)
            );
             
          } 
          const openRouterModel = mapToOpenRouterModel(aiModel); 
           
          setUseOpenRouter(true);
          
          // Call OpenRouter API
          const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://donorspherex.vercel.app",
              "X-Title": "DonorSphereX",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": openRouterModel,
              "messages": [ 
                {
                  role: "system",
                  content: "IMPORTANT: Your response must be valid JSON in this exact format: {\"answer\": \"Your helpful response here\", \"suggestedQuestions\": [\"Question 1\", \"Question 2\", \"Question 3\"]}. Do not include any explanations or formatting outside of this JSON structure."
                }, 
                ...messagesToSend.map(m => ({
                  role: m.role,
                  content: m.content
                }))
              ],
              "temperature": 0.5,
              "max_tokens": 800
            })
          });
          
          if (!openRouterResponse.ok) {
            throw new Error(`OpenRouter API error: ${openRouterResponse.status} ${openRouterResponse.statusText}`);
          }
          
          const openRouterData = await openRouterResponse.json();
          // Get the raw response content from OpenRouter
          const rawResponse = openRouterData.choices[0].message.content;
           
          try { 
            let parsedResponse = JSON.parse(rawResponse); 
            aiResponse = JSON.stringify(parsedResponse);
          } catch (jsonError) { 
            aiResponse = JSON.stringify({
              answer: rawResponse,
              suggestedQuestions: [
                "How can I donate blood?",
                "What are the eligibility requirements?",
                "How do I request blood?"
              ]
            });
          } 
        }
         
        const messagesWithResponse = [
          ...updatedConversation.messages,
          { role: 'assistant', content: aiResponse, time: new Date().toISOString() }
        ];
        
        const finalConversation = {
          ...updatedConversation,
          messages: messagesWithResponse, 
          title: generateTitle(messagesWithResponse.filter(m => m.role === 'user'))
        };
         
        setConversations(prev => 
          prev.map(c => c.id === finalConversation.id ? finalConversation : c)
        );
        await setItem(finalConversation);
        
      } catch (error) {
        console.error("All API attempts failed:", error);
        
        // Determine more specific error message based on error type
        let errorMessage = "Sorry, I'm having trouble connecting to my knowledge base right now.";
        
        if (error.message?.includes('rate limit')) {
          errorMessage = "I'm currently experiencing high demand. Please try again in a moment.";
        } else if (error.message?.includes('OpenRouter API key is missing')) {
          errorMessage = "Sorry, both primary and backup AI services are unavailable right now.";
        } else if (error.message?.includes('OpenRouter API error')) {
          errorMessage = "Both primary and backup AI services are experiencing issues. Please try again later.";
        }
        
        // Comprehensive fallback response
        const fallbackResponse = JSON.stringify({
          answer: `${errorMessage} Please try again in a moment.`,
          suggestedQuestions: [
            "How can I donate blood?",
            "What are the eligibility requirements?",
            "How do I request blood?",
            "Show me donation locations"
          ]
        });
        
        const fallbackConversation = {
          ...updatedConversation,
          messages: [
            ...updatedConversation.messages,
            { role: 'assistant', content: fallbackResponse }
          ]
        };
        
        setConversations(prev => 
          prev.map(c => c.id === fallbackConversation.id ? fallbackConversation : c)
        );
        await setItem(fallbackConversation);
        setError("Failed to get AI response. Using fallback.");
      }
      
    } catch (err) {
      setError("Failed to update conversation");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await removeItem(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }
    } catch (err) {
      setError("Failed to delete conversation");
      console.error(err);
    }
  };

  // Save the last active conversation ID whenever it changes
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('lastActiveConversationId', currentConversationId); 
    }
  }, [currentConversationId]);

  // We're now using fixed models

  const value = {
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
    userContext,
    setUserContext,
    websiteContext,
    aiModel,
    useOpenRouter,
    setUseOpenRouter
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};
