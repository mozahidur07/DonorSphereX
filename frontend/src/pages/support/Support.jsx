import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIProvider } from './AIProvider';
import ChatBot from './ChatBot';

const FAQItem = ({ question, answer, category }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="overflow-hidden">
      <button
        className="flex justify-between items-start w-full my-1 border border-gray-200 rounded-lg py-3 px-4 sm:py-4 sm:px-6 text-left focus:outline-none hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2">
          <span className="bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded w-fit">
            {category}
          </span>
          <span className="text-base sm:text-lg font-medium text-gray-900">{question}</span>
        </div>
        <svg
          className={`flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 text-gray-500 transform transition-transform duration-200 mt-1 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50"
          >
            <div className="p-3 sm:p-4">
              <p className="text-sm sm:text-base text-gray-600">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Support = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: '',
    phone: '',
    urgency: 'normal',
    preferredContact: 'email',
    attachments: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I\'m your virtual assistant. How can I help you today?',
      time: new Date(),
      options: [
        'How can I donate blood?',
        'Am I eligible to donate?',
        'Where is the nearest donation center?',
        'What should I do after donating?'
      ]
    }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [ratedArticles, setRatedArticles] = useState({});
  
  // Track user activity for personalized support
  useEffect(() => {
    const trackActivity = setTimeout(() => {
      if (!showChatbot && !submitted) {
        setShowChatbot(true);
      }
    }, 45000); // Show chatbot after 45 seconds of inactivity

    return () => clearTimeout(trackActivity);
  }, [showChatbot, submitted]);
  
  // Make closeChatbot function available to the ChatBot component
  useEffect(() => {
    // Make this function globally available so ChatBot.jsx can access it
    window.closeChatbot = () => {
      // We just hide the chatbot - the conversation ID will persist in localStorage
      setShowChatbot(false);
    };
    
    return () => {
      delete window.closeChatbot;
    };
  }, []);
  
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setContactForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setContactForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!contactForm.name.trim()) errors.name = 'Name is required';
    if (!contactForm.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!contactForm.category) errors.category = 'Please select a category';
    if (!contactForm.subject.trim()) errors.subject = 'Subject is required';
    if (!contactForm.message.trim()) errors.message = 'Message is required';
    else if (contactForm.message.trim().length < 20) {
      errors.message = 'Message should be at least 20 characters long';
    }
    if (contactForm.phone && !/^\+?[0-9]{10,15}$/.test(contactForm.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
  };
  
  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: '',
        phone: '',
        urgency: 'normal',
        preferredContact: 'email',
        attachments: []
      });
    }, 1500);
  };

  const handleChatbotSubmit = (e) => {
    e.preventDefault();
    if (!chatbotInput.trim()) return;
    
    // Add user message
    setChatbotMessages(prev => [...prev, {
      sender: 'user',
      text: chatbotInput,
      time: new Date()
    }]);
    
    // Simple AI response logic
    setTimeout(() => {
      let botResponse = "I'm sorry, I don't have information about that yet. Would you like to contact our support team?";
      let responseOptions = ["Contact Support", "Ask another question"];
      
      // Simple keyword matching
      const input = chatbotInput.toLowerCase();
      if (input.includes('donate') || input.includes('donation')) {
        botResponse = "To donate blood, you need to be at least 18 years old, weigh at least 50kg, and be in good health. You can find your nearest donation center using our 'Find a Center' feature on the homepage.";
        responseOptions = ["Where is the nearest center?", "What should I bring?", "How long does it take?"];
      } else if (input.includes('eligibility')) {
        botResponse = "Blood donor eligibility depends on your health, travel history, and certain medical conditions. The general requirements include being at least 18 years old and weighing at least 50kg.";
        responseOptions = ["What medical conditions disqualify me?", "Can I donate if I have a tattoo?", "How often can I donate?"];
      } else if (input.includes('appointment')) {
        botResponse = "You can schedule an appointment by logging into your account and clicking on 'Schedule Donation' on your dashboard.";
        responseOptions = ["How do I cancel an appointment?", "What should I do before my appointment?", "How long will it take?"];
      } else if (input.includes('hello') || input.includes('hi')) {
        botResponse = "Hello! How can I assist you with your blood donation queries today?";
        responseOptions = ["How can I donate blood?", "Am I eligible to donate?", "Where is the nearest donation center?"];
      } else if (input.includes('thank')) {
        botResponse = "You're welcome! Is there anything else I can help you with?";
        responseOptions = ["How often can I donate?", "What happens to my blood after donation?", "No, that's all"];
      }
      
      setChatbotMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponse,
        options: responseOptions,
        time: new Date()
      }]);
    }, 600);
    
    setChatbotInput('');
  };

  const rateArticleHelpful = (id, isHelpful) => {
    setRatedArticles({
      ...ratedArticles,
      [id]: isHelpful
    });
  };
  
  const faqs = [
    {
      id: 1,
      category: "Donation Process",
      question: "How often can I donate blood?",
      answer: "You can donate whole blood every 3 months (12 weeks). This waiting period allows your body to replenish the red blood cells that were removed during donation. If you donate other blood components like plasma, you may be eligible to donate more frequently."
    },
    {
      id: 2,
      category: "Eligibility",
      question: "What are the eligibility requirements for blood donation?",
      answer: "General requirements include being at least 18 years old, weighing at least 50kg, being in good health, and not having certain medical conditions. However, specific requirements may vary based on the type of donation and local regulations. You'll need to complete a health questionnaire before each donation."
    },
    {
      id: 3,
      category: "Donation Process",
      question: "How long does the donation process take?",
      answer: "The entire process typically takes about 30-45 minutes, though the actual blood collection only takes about 8-10 minutes. The process includes registration, mini-health check, donation, and a brief rest period with refreshments afterward."
    },
    {
      id: 4,
      category: "Medical",
      question: "Is donating blood safe?",
      answer: "Yes, donating blood is very safe. All equipment used for the collection is sterile and used only once. The staff are trained professionals who follow strict protocols. Some people may experience mild side effects like lightheadedness or bruising at the needle site, but serious complications are extremely rare."
    },
    {
      id: 5,
      category: "Preparation",
      question: "How do I prepare for blood donation?",
      answer: "Make sure you're well hydrated (drink plenty of water), have eaten a healthy meal, and get a good night's sleep before donating. Avoid fatty foods, alcohol, and smoking before donation. Wear comfortable clothing with sleeves that can be rolled up above the elbow."
    },
    {
      id: 6,
      category: "Post Donation",
      question: "What happens to my blood after I donate?",
      answer: "Your donated blood is processed and tested for infectious diseases. It may be separated into components (red cells, platelets, plasma) that can help multiple patients. The blood is then distributed to hospitals where it's used for patients who need transfusions due to surgery, trauma, disease, or other medical conditions."
    },
    {
      id: 7,
      category: "Medical",
      question: "How do I know my blood type?",
      answer: "After your first donation, you can request information about your blood type. Many donation centers will inform you of your blood type after testing your donation. You can also find out your blood type through your doctor or by purchasing a home blood typing kit."
    },
    {
      id: 8,
      category: "Account",
      question: "What is the verification process for KYC?",
      answer: "The KYC (Know Your Customer) verification process involves uploading your Aadhar card for identity verification. Once submitted, our staff reviews the document to verify your identity. This typically takes 1-2 business days. After successful verification, your profile will be marked as verified."
    },
    {
      id: 9,
      category: "Medical",
      question: "Can I donate if I have a medical condition?",
      answer: "It depends on the condition. Many medical conditions do not prevent blood donation, but some may temporarily or permanently defer you. Always disclose your medical history to the donation staff who will determine your eligibility."
    },
    {
      id: 10,
      category: "Post Donation",
      question: "What should I eat after donating blood?",
      answer: "After donating blood, it's important to eat iron-rich foods like red meat, spinach, beans, and fortified cereals. You should also drink plenty of fluids to help your body replace the lost blood volume. Avoid alcohol for at least 24 hours after donation."
    },
    {
      id: 11,
      category: "Technical",
      question: "How do I update my profile information?",
      answer: "You can update your profile information by logging into your account, navigating to the 'Profile' section, and clicking on 'Edit Profile'. From there, you can update your personal information, contact details, and other account settings."
    },
    {
      id: 12,
      category: "Eligibility",
      question: "Can I donate if I've recently traveled abroad?",
      answer: "Recent travel to certain regions may temporarily defer your eligibility to donate blood, particularly areas with high prevalence of malaria, Zika virus, or other infectious diseases. The deferral period varies depending on the region visited and local regulations."
    }
  ];
  
  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for the filter
  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];
  
  return (
    <AIProvider userId="user123">
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600">Help & Support Center</h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about blood donation, get support for your account, or contact our team directly.
            </p>
          </div>
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex rounded-md shadow-sm w-full sm:w-auto" role="group">
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-l-lg border flex-1 sm:flex-auto ${
                activeTab === 'faq'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="sm:hidden">FAQs</span>
              <span className="hidden sm:inline">Frequently Asked Questions</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-r-lg border flex-1 sm:flex-auto ${
                activeTab === 'contact'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Contact Support
            </button>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {/* FAQ Section */}
          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 sm:mb-8">
                <div className="p-4 sm:p-6">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Frequently Asked Questions</h2>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="search"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full pl-9 sm:pl-10 p-2 sm:p-2.5"
                          placeholder="Search questions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      {/* Category Filter */}
                      <div className="w-full md:w-48">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2 sm:p-2.5"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* FAQ List */}
                  <div className="space-y-0">
                    {filteredFaqs.length > 0 ? (
                      filteredFaqs.map((faq) => (
                        <FAQItem 
                          key={faq.id} 
                          question={faq.question} 
                          answer={faq.answer} 
                          category={faq.category} 
                        />
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-10">
                        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9.5 15.5a4 4 0 119 0 4 4 0 01-9 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200">
                    <p className="text-gray-600 text-center text-sm sm:text-base">
                      Can't find what you're looking for? <button onClick={() => setActiveTab('contact')} className="text-red-600 font-medium hover:text-red-500">Contact Support</button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Knowledge Base Section */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 sm:mb-8">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Helpful Resources</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      {
                        id: 'guide1',
                        title: 'Complete Donation Guide',
                        description: 'Step-by-step guide to the blood donation process',
                        icon: (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )
                      },
                      {
                        id: 'guide2',
                        title: 'Medical Eligibility Criteria',
                        description: 'Comprehensive list of medical conditions and their impact on eligibility',
                        icon: (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )
                      },
                      {
                        id: 'guide3',
                        title: 'First-Time Donor Tips',
                        description: 'Essential tips and what to expect for first-time donors',
                        icon: (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )
                      }
                    ].map((resource) => (
                      <div key={resource.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {resource.icon}
                          </div>
                          <div className="ml-2 sm:ml-3">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">{resource.title}</h3>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">{resource.description}</p>
                            <div className="mt-2 sm:mt-3">
                              <a href="#" className="inline-flex items-center text-xs sm:text-sm font-medium text-red-600 hover:text-red-500">
                                Read more
                                <svg className="ml-1 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </a>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
                              <span className="text-xs text-gray-500">Was this helpful?</span>
                              <button 
                                onClick={() => rateArticleHelpful(resource.id, true)}
                                className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${ratedArticles[resource.id] === true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                              >
                                Yes
                              </button>
                              <button 
                                onClick={() => rateArticleHelpful(resource.id, false)}
                                className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${ratedArticles[resource.id] === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Contact Form Section */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 sm:mb-8">
                <div className="p-4 sm:p-6">
                  <div className="mb-5 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Support</h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Have a question or need help? Fill out the form below and our team will get back to you as soon as possible.
                    </p>
                  </div>
                  
                  {submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="mt-3 text-lg font-medium text-green-800">Message Received!</h3>
                      <p className="mt-2 text-sm text-green-700">
                        Thank you for reaching out. We've received your message and will respond to you shortly.
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setSubmitted(false)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Send Another Message
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={contactForm.name}
                            onChange={handleContactFormChange}
                            className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={contactForm.email}
                            onChange={handleContactFormChange}
                            className={`mt-1 block w-full border ${formErrors.email ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number (optional)
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={contactForm.phone}
                            onChange={handleContactFormChange}
                            className={`mt-1 block w-full border ${formErrors.phone ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                            placeholder="+91 98765 43210"
                          />
                          {formErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="category"
                            id="category"
                            required
                            value={contactForm.category}
                            onChange={handleContactFormChange}
                            className={`mt-1 block w-full border ${formErrors.category ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          >
                            <option value="">Select a category</option>
                            <option value="donation">Donation Process</option>
                            <option value="account">Account Issues</option>
                            <option value="technical">Technical Support</option>
                            <option value="eligibility">Eligibility Questions</option>
                            <option value="medical">Medical Concerns</option>
                            <option value="feedback">Feedback</option>
                            <option value="other">Other</option>
                          </select>
                          {formErrors.category && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="subject"
                          id="subject"
                          required
                          value={contactForm.subject}
                          onChange={handleContactFormChange}
                          className={`mt-1 block w-full border ${formErrors.subject ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          placeholder="Brief description of your inquiry"
                        />
                        {formErrors.subject && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="message"
                          id="message"
                          rows={5}
                          required
                          value={contactForm.message}
                          onChange={handleContactFormChange}
                          className={`mt-1 block w-full border ${formErrors.message ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                          placeholder="Please provide details about your inquiry or question..."
                        />
                        <div className="flex justify-between mt-1">
                          {formErrors.message ? (
                            <p className="text-sm text-red-600">{formErrors.message}</p>
                          ) : (
                            <p className="text-xs text-gray-500">Minimum 20 characters</p>
                          )}
                          <p className="text-xs text-gray-500">{contactForm.message.length}/1000</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attachments (optional)
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            </div>
                            <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileUpload} />
                          </label>
                        </div>

                        {contactForm.attachments.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded files:</h4>
                            <ul className="space-y-2">
                              {contactForm.attachments.map((file, index) => (
                                <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                  <span className="text-sm text-gray-700">{file.name}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => removeAttachment(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency
                          </label>
                          <div className="flex gap-4">
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="urgency-low" 
                                name="urgency" 
                                value="low"
                                checked={contactForm.urgency === 'low'}
                                onChange={handleContactFormChange}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                              />
                              <label htmlFor="urgency-low" className="ml-2 text-sm font-medium text-gray-700">Low</label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="urgency-normal" 
                                name="urgency" 
                                value="normal"
                                checked={contactForm.urgency === 'normal'}
                                onChange={handleContactFormChange}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                              />
                              <label htmlFor="urgency-normal" className="ml-2 text-sm font-medium text-gray-700">Normal</label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="urgency-high" 
                                name="urgency" 
                                value="high"
                                checked={contactForm.urgency === 'high'}
                                onChange={handleContactFormChange}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                              />
                              <label htmlFor="urgency-high" className="ml-2 text-sm font-medium text-gray-700">High</label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Contact Method
                          </label>
                          <div className="flex gap-4">
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="contact-email" 
                                name="preferredContact" 
                                value="email"
                                checked={contactForm.preferredContact === 'email'}
                                onChange={handleContactFormChange}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                              />
                              <label htmlFor="contact-email" className="ml-2 text-sm font-medium text-gray-700">Email</label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="contact-phone" 
                                name="preferredContact" 
                                value="phone"
                                checked={contactForm.preferredContact === 'phone'}
                                onChange={handleContactFormChange}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                              />
                              <label htmlFor="contact-phone" className="ml-2 text-sm font-medium text-gray-700">Phone</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Privacy Policy Checkbox */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input 
                            id="privacy" 
                            type="checkbox" 
                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-red-300"
                            required
                          />
                        </div>
                        <label htmlFor="privacy" className="ml-2 text-sm text-gray-700">
                          I agree to the <a href="#" className="text-red-600 hover:underline">privacy policy</a> and consent to being contacted regarding my inquiry.
                        </label>
                      </div>
                      
                      <div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isSubmitting 
                              ? 'bg-red-300 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                        >
                          {isSubmitting ? (
                            <div className="flex justify-center items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </div>
                          ) : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  )}
                  
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div className="ml-2 sm:ml-3">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-900">Phone Support</h3>
                            <p className="mt-1 text-xs text-gray-500">Mon-Fri, 9am to 6pm</p>
                            <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">+91 123 456 7890</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-2 sm:ml-3">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-900">Email Support</h3>
                            <p className="mt-1 text-xs text-gray-500">24/7 response</p>
                            <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">support@donorspherex.com</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="ml-2 sm:ml-3">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-900">Address</h3>
                            <p className="mt-1 text-xs text-gray-500">Visit us</p>
                            <p className="mt-1 text-xs sm:text-sm font-medium text-gray-900">123 Blood Donor Ave, City</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Emergency Contact Section */}
          <div className="bg-red-600 rounded-lg shadow-lg p-4 sm:p-6 text-white mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Emergency Contact</h2>
            <p className="text-sm sm:text-base mb-3 sm:mb-4">For medical emergencies related to blood donation or transfusion, please contact:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-red-700 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Emergency Hotline</h3>
                <p className="text-base sm:text-lg font-bold">+91 999 888 7777</p>
                <p className="text-xs sm:text-sm opacity-80 mt-1">Available 24/7</p>
              </div>
              <div className="bg-red-700 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Nearest Hospital</h3>
                <p className="text-base sm:text-lg font-bold">City Hospital</p>
                <p className="text-xs sm:text-sm opacity-80 mt-1">5 km away from your location</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Chatbot */}
      <div className={`fixed bottom-5 right-5 ${showChatbot ? 'block' : 'hidden'} z-50`}>
        <div className="bg-transparent rounded-lg overflow-hidden">
          <ChatBot />
        </div>
      </div>
      
      {/* Chatbot Trigger Button (only shown when chatbot is hidden) */}
      {!showChatbot && (
        <button
          onClick={() => {
            // Show the chatbot when clicked
            setShowChatbot(true);
          }}
          className="fixed bottom-4 sm:bottom-5 right-4 sm:right-5 bg-gradient-to-r from-[#248CC4] to-[#1a6b9a] text-white rounded-full p-3 sm:p-4 shadow-xl hover:from-[#1a6b9a] hover:to-[#0d5a85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a6f99] z-50 border border-white/20 chatbox-open-btn"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
    </AIProvider>
  );
};

export default Support;
