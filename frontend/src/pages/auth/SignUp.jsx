import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, error: authError, setError: setAuthError, currentUser } = useAuth();
  
  // Redirect to profile if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser, navigate]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: {
      donor: true,
      staff: false
    },
    showPassword: false,
    showConfirmPassword: false,
    agreeToTerms: false
  });
  
  // Password strength validation
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return '';
    
    // Check for requirements
    const hasMinLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    
    // Calculate score
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;
    if (hasUpperCase) score += 1;
    if (hasLowerCase) score += 1;
    
    // Determine strength based on score
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'donor' || name === 'staff') {
      setFormData(prev => ({
        ...prev,
        roles: {
          ...prev.roles,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setAuthError("Passwords don't match!");
      return;
    }
    
    if (formData.password.length < 8) {
      setAuthError("Password must be at least 8 characters long");
      return;
    }
    
    if (!Object.values(formData.roles).some(val => val === true)) {
      setAuthError("Please select at least one role");
      return;
    }
    
    if (!formData.agreeToTerms) {
      setAuthError("You must agree to the terms and conditions");
      return;
    }
    
    try {
      setLoading(true);
      
      // Keep roles as an object with boolean values (matches backend schema)
      const roleObject = {
        donor: formData.roles.donor,
        staff: formData.roles.staff
      };
      
      // Prepare data for submission
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: roleObject  // Changed from "roles" to "role" to match backend field name
      };
      
      // Call register function from auth context
      // This will register AND log in the user in a single step
      console.log('About to register with data:', userData);
      const result = await register(userData);
      console.log('Registration result:', result);
      
      if (result.success) {
        // Show success message
        alert('Registration successful! Welcome to Life Donor. You are now logged in.');

        // Redirect to profile immediately (user is automatically logged in by the register function)
        navigate('/profile');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEE8E8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white rounded-2xl shadow-xl p-8 border border-red-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-100 rounded-full opacity-50"></div>
        <div className="absolute top-40 -left-10 w-24 h-24 bg-red-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-100 rounded-full opacity-40"></div>
        
        {/* Blood drop icon decoration - top left */}
        <div className="absolute top-0 left-0 text-red-200 opacity-30 transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
        
        {/* Heart icon decoration - bottom right */}
        <div className="absolute bottom-0 right-0 text-red-200 opacity-30 transform translate-x-1/4 translate-y-1/4">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        
        <div className="text-center relative z-10">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Join Life Donor</h2>
          <div className="mt-2 text-center text-sm text-gray-600 flex justify-center items-center space-x-1">
            <span>Or</span>
            <Link to="/signin" className="font-medium text-red-600 hover:text-red-800 transition-colors duration-300 flex items-center">
              <span>sign in to your existing account</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="full-name" className="flex items-center text-sm font-semibold text-gray-800 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Full Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 sm:text-sm bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email-address" className="flex items-center text-sm font-semibold text-gray-800 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 sm:text-sm bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border border-red-200 shadow-inner relative overflow-hidden">
              {/* Background decorative blood cell */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-red-200 opacity-30"></div>
              <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-red-200 opacity-20"></div>
              
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Choose your role(s)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative flex items-start bg-white bg-opacity-70 p-2 rounded-lg shadow-sm border border-red-100 hover:border-red-300 transition-colors duration-200">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      id="donor-role"
                      name="donor"
                      type="checkbox"
                      checked={formData.roles.donor}
                      onChange={handleChange}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 transition duration-150"
                    />
                  </div>
                  <div className="ml-2">
                    <label htmlFor="donor-role" className="font-medium text-gray-700 flex flex-wrap items-center cursor-pointer">
                      <div className="bg-red-500 p-1 rounded-full mr-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center flex-wrap">
                          <span className="text-sm font-bold text-gray-900">Donor</span>
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-1.5 py-px rounded-full ml-1">Recommended</span>
                        </div>
                        <p className="text-gray-500 text-xs">Blood or organ donor</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="relative flex items-start bg-white bg-opacity-70 p-2 rounded-lg shadow-sm border border-red-100 hover:border-red-300 transition-colors duration-200">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      id="staff-role"
                      name="staff"
                      type="checkbox"
                      checked={formData.roles.staff}
                      onChange={handleChange}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 transition duration-150"
                    />
                  </div>
                  <div className="ml-2">
                    <label htmlFor="staff-role" className="font-medium text-gray-700 flex flex-wrap items-center cursor-pointer">
                      <div className="bg-red-500 p-1 rounded-full mr-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center flex-wrap">
                          <span className="text-sm font-bold text-gray-900">Medical Staff</span>
                          <span className="bg-yellow-100 text-red-800 text-xs px-1.5 py-px rounded-full ml-1">Approval needed</span>
                        </div>
                        <p className="text-gray-500 text-xs">Healthcare professionals</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-800 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={formData.showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 sm:text-sm bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formData.password && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {formData.showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center mb-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                      <div 
                        className={`h-1.5 rounded-full ${
                          getPasswordStrength() === "weak" ? "w-1/4 bg-red-500" :
                          getPasswordStrength() === "medium" ? "w-2/4 bg-yellow-500" :
                          "w-full bg-green-500"
                        }`} 
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      getPasswordStrength() === "weak" ? "text-red-600" :
                      getPasswordStrength() === "medium" ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {getPasswordStrength() === "weak" ? "Weak" :
                       getPasswordStrength() === "medium" ? "Medium" : "Strong"}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1 mt-1">
                    <div className="flex items-center">
                      <span className={`mr-1 ${formData.password.length >= 8 ? "text-green-600" : "text-gray-400"}`}>
                        {formData.password.length >= 8 ? "✓" : "○"}
                      </span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-1 ${/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-400"}`}>
                        {/[0-9]/.test(formData.password) ? "✓" : "○"}
                      </span>
                      <span>At least one number</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-1 ${/[!@#$%^&*]/.test(formData.password) ? "text-green-600" : "text-gray-400"}`}>
                        {/[!@#$%^&*]/.test(formData.password) ? "✓" : "○"}
                      </span>
                      <span>At least one special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!formData.password && (
                <div className="mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-gray-500">Must be at least 8 characters with a number and special character</p>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="flex items-center text-sm font-semibold text-gray-800 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Confirm Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={formData.showConfirmPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 sm:text-sm bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {formData.confirmPassword && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {formData.showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {formData.password && formData.confirmPassword && (
                <div className="mt-1 flex items-center">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-green-600">Passwords match</p>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-red-600">Passwords don't match</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center p-3 bg-white bg-opacity-70 rounded-lg border border-red-100 mt-4">
            <input
              id="agree-terms"
              name="agreeToTerms"
              type="checkbox"
              required
              className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500 transition duration-150"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-red-600 hover:text-red-800 transition-colors duration-300 underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-red-600 hover:text-red-800 transition-colors duration-300 underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="block sm:inline">{authError}</span>
              </div>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-200 group-hover:text-white transition ease-in-out duration-150" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className="text-base font-bold tracking-wide">{loading ? 'Creating Account...' : 'Become a Lifesaver'}</span>
            </button>
          </div>
          
          <div className="flex items-center justify-center pt-4 border-t border-red-100 mt-4">
            <div className="text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-red-600 hover:text-red-800 transition-colors duration-300 ml-1">
                Sign in here
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-5 space-y-1 relative">
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-100 to-transparent"></div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-600 font-medium">By joining, you agree to our commitment to saving lives through donation</p>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Life Donor © {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
