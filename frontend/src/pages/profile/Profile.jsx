import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../data/userData';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Icons
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 001-1v-4a1 1 0 10-2 0v4a1 1 0 001 1z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = ({ className = "h-5 w-5 text-green-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ExclamationCircleIcon = ({ className = "h-5 w-5 text-red-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = ({ className = "h-5 w-5 text-yellow-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

// Form Field with optional tooltip
const FormField = ({ 
  label, 
  id, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  tooltipContent = "", 
  options = [],
  placeholder = "",
  isCompleted = false,
  className = "",
}) => {
  const tooltipId = `tooltip-${id}`;
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltipContent && (
          <>
            <span 
              data-tooltip-id={tooltipId} 
              className="ml-1 cursor-help"
            >
              <InfoIcon />
            </span>
            <Tooltip id={tooltipId} place="right" className="max-w-xs bg-gray-900 text-white p-2 text-xs rounded">
              {tooltipContent}
            </Tooltip>
          </>
        )}
        {isCompleted && (
          <span className="ml-2"><CheckCircleIcon className="h-4 w-4 text-green-500" /></span>
        )}
      </div>
      
      {type === "select" ? (
        <select
          id={id}
          name={id}
          value={value || ""}
          onChange={onChange}
          required={required}
          className="mt-1 block w-full py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={id}
          value={value || ""}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="mt-1 block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          rows={3}
        />
      ) : type === "file" ? (
        <input
          id={id}
          name={id}
          type="file"
          onChange={onChange}
          required={required}
          className={` ${className} mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100`}
          accept="image/*"
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value || ""}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`mt-1 ${className} block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
        />
      )}
    </div>
  );
};

const Profile = () => {
  const { updateProfile, logout, changePassword } = useAuth();
  const { userData, isLoading, fetchUserData, updateUserData, uploadKycDocument, uploadProfilePicture } = useUserData();
  const [activeTab, setActiveTab] = useState('basic');
  const Navigate = useNavigate();
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isSubmittingPassword: false,
    passwordError: null,
    passwordSuccess: null,
    logoutAllDevices: true
  });
  
  // Use userData from the store
  const userDataSource = userData || {};
  
  const [formState, setFormState] = useState({
    ...userDataSource,
    address: { 
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      ...(userDataSource?.address || {})
    },
    medicalInfo: {
      height: '',
      weight: '',
      allergies: userDataSource?.medicalInfo?.allergies || [],
      medications: userDataSource?.medicalInfo?.medications || [],
      conditions: userDataSource?.medicalInfo?.conditions || [],
      lastCheckup: '',
      ...(userDataSource?.medicalInfo || {})
    },
    profileCompletionDetails: {
      basicInfo: false,
      contactInfo: false,
      medicalInfo: false,
      kycVerification: false,
      ...(userDataSource?.profileCompletionDetails || {})
    },
    kycStatus: userDataSource?.kycStatus || 'not_submitted',
    kycDocument: userDataSource?.kycDocument || { url: null },
    kycDocuments: userDataSource?.kycDocuments || { aadharCard: { url: null } },
  });
  
  const [kycFile, setKycFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileCompletionItems, setProfileCompletionItems] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  
  // Format date to YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
      
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  };
  

  // Function to fetch user donations
  const fetchUserDonations = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error("No authentication token found");
      return;
    }
    
    try {
      // Get API URL from environment variable or use default
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // Fetch user's donations from the API
      const response = await axios.get(`${API_URL}/donations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (response.data.status === 'success') { 
        setUserDonations(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch donation data');
      }
    } catch (error) {
      console.error('Error fetching donation data:', error);
    }
  };

  useEffect(() => {
    fetchUserData().then(data => {
      // After fetching user data, fetch their donations
      fetchUserDonations();
    }).catch(err => {
      console.error("Error fetching user data:", err);
    });
    
    return () => {
      if (kycFile && kycFile._previewUrl) {
        URL.revokeObjectURL(kycFile._previewUrl);
      }
    };
  }, [fetchUserData, kycFile]);

  // Update formState when userData changes
  useEffect(() => {
    if (userData) {
      setFormState(prevState => ({
        ...prevState,
        ...userData,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        bloodType: userData.bloodType || '',
        dateOfBirth: formatDateForInput(userData.dateOfBirth) || '',
        address: { 
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          postalCode: userData.address?.postalCode || '',
          country: userData.address?.country || ''
        },
        medicalInfo: {
          height: userData.medicalInfo?.height || '',
          weight: userData.medicalInfo?.weight || '',
          allergies: Array.isArray(userData.medicalInfo?.allergies) ? userData.medicalInfo.allergies : [],
          medications: Array.isArray(userData.medicalInfo?.medications) ? userData.medicalInfo.medications : [],
          conditions: Array.isArray(userData.medicalInfo?.conditions) ? userData.medicalInfo.conditions : [],
          lastCheckup: formatDateForInput(userData.medicalInfo?.lastCheckup) || '' || ''
        },
        kycStatus: userData.kycStatus || 'not_submitted',
        kycDocument: userData.kycDocument || { url: null },
        kycDocuments: userData.kycDocuments || { 
          aadharCard: { url: userData.kycDocument?.url || null }
        },
        profileCompletion: userData.profileCompletion || 0,
        profileCompletionDetails: userData.profileCompletionDetails || {
          basicInfo: false,
          contactInfo: false,
          medicalInfo: false,
          kycVerification: false
        },
        lastDonation: userData.lastDonation || 'Never donated',
        nextEligibleDonation: userData.nextEligibleDonation || 'Anytime',
        accountCreated: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A',
        donationHistory: userData.donationHistory || []
      }));
    }
  }, [userData]);
  
  useEffect(() => {
    const items = [];
    let completedSections = 0;
    let totalSections = 4; 
    
    // Check basic info
    const basicInfoComplete = formState.name && formState.dateOfBirth && formState.gender && formState.bloodType;
    if (!basicInfoComplete) {
      items.push({ 
        section: 'basic', 
        message: 'Complete your basic information' 
      });
    } else {
      completedSections++;
    }
    
    // Check contact info
    const contactInfoComplete = formState.phone && 
      formState.address.street && 
      formState.address.city && 
      formState.address.state && 
      formState.address.postalCode;
      
    if (!contactInfoComplete) {
      items.push({ 
        section: 'contact', 
        message: 'Add your contact information' 
      });
    } else {
      completedSections++;
    }
    
    // Check medical info
    const medicalInfoComplete = formState.medicalInfo?.weight && formState.medicalInfo?.height;
    if (!medicalInfoComplete) {
      items.push({ 
        section: 'medical', 
        message: 'Add your medical information' 
      });
    } else {
      completedSections++;
    }
    
    // Check KYC status
    if (formState.kycStatus !== 'completed') {
      items.push({ 
        section: 'kyc', 
        message: formState.kycStatus === 'pending' 
          ? 'KYC verification is pending approval' 
          : formState.kycStatus === 'rejected'
            ? 'KYC verification was rejected. Please resubmit.'
            : 'Complete KYC verification' 
      });
    } else {
      completedSections++;
    }
    
    const completionPercentage = Math.round((completedSections / totalSections) * 100);
    
    setProfileCompletionItems(items);
    setFormState(prev => ({
      ...prev,
      profileCompletion: completionPercentage,
      profileCompletionDetails: {
        basicInfo: basicInfoComplete,
        contactInfo: contactInfoComplete,
        medicalInfo: medicalInfoComplete,
        kycVerification: formState.kycStatus === 'completed'
      }
    }));
  }, [formState.name, formState.dateOfBirth, formState.gender, formState.bloodType,
      formState.phone, formState.address, formState.medicalInfo, formState.kycStatus]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormState({
        ...formState,
        [parent]: {
          ...formState[parent],
          [child]: value
        }
      });
    } else {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };
  
  const handleFileChange = (e) => {
    // First revoke any old object URLs to prevent memory leaks
    if (kycFile && kycFile._previewUrl) {
      URL.revokeObjectURL(kycFile._previewUrl);
    }
    
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Add timestamp to ensure the browser sees it as a new file
      const uniqueFile = new File([file], 
        `${Date.now()}-${file.name}`, 
        { type: file.type, lastModified: Date.now() }
      );
       
      
      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(uniqueFile); 
      
      // Save the preview URL with the file object for later cleanup
      uniqueFile._previewUrl = previewUrl;
      
      // Set the file state
      setKycFile(uniqueFile);
      
      // Create a temporary URL for preview before uploading to Supabase
      setFormState(prevState => ({
        ...prevState,
        // Set both kycDocument and kycDocuments for compatibility
        kycDocument: {
          ...(prevState.kycDocument || {}),
          url: previewUrl,
          previewUrl: previewUrl
        },
        kycDocuments: {
          ...(prevState.kycDocuments || {}),
          previewUrl: previewUrl,
          aadharCard: { url: previewUrl }
        }
      }));
       
    }
  };
  
  const handleProfilePicChange = (e) => {
    if (e.target.files.length > 0) {
      setProfilePicFile(e.target.files[0]);
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setFormState({
        ...formState,
        profilePicturePreview: previewUrl
      });
    }
  };
  
  const handleProfilePicUpload = async () => {
    if (!profilePicFile) {
      alert('Please select an image to upload');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await uploadProfilePicture(profilePicFile);
      
      if (result.success) {
        // Update form state with new profile picture URL from Supabase
        setFormState({
          ...formState,
          profilePicture: {
            url: result.data?.profilePicture?.url || formState.profilePicturePreview
          },
          // Remove the preview since we now have the actual URL
          profilePicturePreview: null
        });
        alert('Profile picture uploaded successfully!');
        setProfilePicFile(null);
      } else {
        throw new Error(result.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert(`Failed to upload profile picture: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitKYC = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!kycFile) {
        alert('Please select a KYC document to upload');
        setIsSubmitting(false);
        return;
      }
       
      
      // Reset any cached file URLs to prevent caching issues
      if (kycFile._url) {
        URL.revokeObjectURL(kycFile._url);
        delete kycFile._url;
      }
      
      // Use the uploadKycDocument function from the store
      const result = await uploadKycDocument(kycFile);
      
      if (result.success) { 
         
        const documentUrl = result.data?.kycDocument?.url || 
                           result.data?.publicUrl || 
                           (result.data && result.data.publicUrl);
                             
        await new Promise(resolve => setTimeout(resolve, 1000));
         
        setKycFile(null);
         
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          input.value = '';
        });
         
        const freshUserData = await fetchUserData(); 
         
        if (freshUserData) {
          setFormState({
            ...freshUserData,
            dateOfBirth: formatDateForInput(freshUserData.dateOfBirth),
            address: { 
              street: freshUserData.address?.street || '',
              city: freshUserData.address?.city || '',
              state: freshUserData.address?.state || '',
              postalCode: freshUserData.address?.postalCode || '',
              country: freshUserData.address?.country || ''
            },
            medicalInfo: {
              height: freshUserData.medicalInfo?.height || '',
              weight: freshUserData.medicalInfo?.weight || '',
              allergies: freshUserData.medicalInfo?.allergies || [],
              medications: freshUserData.medicalInfo?.medications || [],
              conditions: freshUserData.medicalInfo?.conditions || [],
              lastCheckup: formatDateForInput(freshUserData.medicalInfo?.lastCheckup)
            },
            kycStatus: freshUserData.kycStatus || 'pending',
            kycDocument: freshUserData.kycDocument || { url: documentUrl },
            kycDocuments: freshUserData.kycDocuments || {
              aadharCard: { url: documentUrl }
            }
          });
        }
          
        if (window.confirm('KYC document uploaded successfully and is pending verification. Do you want to refresh the page to see the changes?')) {
          window.location.reload();
        }
      } else {
        throw new Error(result.error || 'Failed to upload KYC document');
      }
    } catch (error) {
      console.error('Error uploading KYC:', error);
      alert(`Failed to upload KYC document: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try { 
      const basicInfoData = {
        name: formState.name || '',
        fullName: formState.name || '',
        dateOfBirth: formState.dateOfBirth || null,
        gender: formState.gender || '',
        bloodType: formState.bloodType || ''
      };
       
      if (basicInfoData.gender && !['male', 'female', 'other', 'prefer_not_to_say', 'prefer not to say'].includes(basicInfoData.gender)) {
        throw new Error('Invalid gender value. Please select a valid option.');
      }
       
       
      const result = await updateUserData(basicInfoData);
      
      if (result.success) { 
        alert("Basic information updated successfully!");
      } else { 
        alert(`Failed to update: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating basic info:', error);
      alert('An error occurred while updating your information');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleContactInfoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try { 
      const cleanAddress = {};
      Object.keys(formState.address).forEach(key => {
        if (formState.address[key] !== undefined && formState.address[key] !== null) {
          cleanAddress[key] = formState.address[key];
        }
      }); 

      const contactInfoData = {
        phone: formState.phone || '',
        address: cleanAddress
      };
       
       
      const result = await updateUserData(contactInfoData);
      
      if (result.success) { 
        alert("Contact information updated successfully!");
      } else { 
        alert(`Failed to update: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      alert('An error occurred while updating your information');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleMedicalInfoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try { 
      const cleanMedicalInfo = {};
      Object.keys(formState.medicalInfo).forEach(key => {
        if (formState.medicalInfo[key] !== undefined && formState.medicalInfo[key] !== null) {
          
          if ((key === 'height' || key === 'weight') && formState.medicalInfo[key] === '') {
            cleanMedicalInfo[key] = null;
          } else {
            cleanMedicalInfo[key] = formState.medicalInfo[key];
          }
        }
      }); 
      const medicalInfoData = {
        medicalInfo: cleanMedicalInfo
      };
       
        
      const result = await updateUserData(medicalInfoData);
      
      if (result.success) { 
        alert("Medical information updated successfully!");
      } else { 
        alert(`Failed to update: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating medical info:', error);
      alert('An error occurred while updating your information');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get appropriate KYC status display
  const getKycStatusDisplay = () => {
    switch (formState.kycStatus) {
      case 'completed':
        return (
          <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            <span>Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-sm">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>Pending Approval</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm">
            <span>Not Submitted</span>
          </div>
        );
    }
  };
  
  // Password strength validation
  const getPasswordStrength = () => {
    const { newPassword } = passwordState;
    if (!newPassword) return '';
    
    // Check for requirements
    const hasMinLength = newPassword.length >= 8;
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*]/.test(newPassword);
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    
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
  
  // Handle password form submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword, logoutAllDevices } = passwordState;
    
    // Clear previous messages
    setPasswordState(prev => ({
      ...prev,
      passwordError: null,
      passwordSuccess: null,
      isSubmittingPassword: true
    }));
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: "All password fields are required",
        isSubmittingPassword: false
      }));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: "New password and confirmation do not match",
        isSubmittingPassword: false
      }));
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: "New password must be at least 8 characters long",
        isSubmittingPassword: false
      }));
      return;
    }
    
    if (!/[0-9]/.test(newPassword)) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: "New password must contain at least one number",
        isSubmittingPassword: false
      }));
      return;
    }
    
    if (!/[!@#$%^&*]/.test(newPassword)) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: "New password must contain at least one special character",
        isSubmittingPassword: false
      }));
      return;
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: "New password must contain at least one uppercase letter",
        isSubmittingPassword: false
      }));
      return;
    }
    
    if (!/[a-z]/.test(newPassword)) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: "New password must contain at least one lowercase letter",
        isSubmittingPassword: false
      }));
      return;
    }
    
    try {
      const result = await changePassword(currentPassword, newPassword, logoutAllDevices);
      
      if (result.success) {
        if (!result.logoutAllDevices) {
          // Show success message
          setPasswordState(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            passwordSuccess: "Password changed successfully",
            isSubmittingPassword: false
          }));
        }
        // If logoutAllDevices is true, the user will be redirected automatically
      } else {
        setPasswordState(prev => ({
          ...prev,
          passwordError: result.error || "Password change failed",
          isSubmittingPassword: false
        }));
      }
    } catch (error) {
      setPasswordState(prev => ({
        ...prev,
        passwordError: error.message || "An error occurred while changing your password",
        isSubmittingPassword: false
      }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100 relative group">
                  {formState.profilePicturePreview || (formState.profilePicture && formState.profilePicture.url) ? (
                    <img 
                      src={formState.profilePicturePreview || formState.profilePicture.url} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  
                  {/* Profile picture overlay with change option */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <label htmlFor="profile-pic-upload" className="text-white text-xs font-medium cursor-pointer">
                      Change
                    </label>
                    <input 
                      type="file"
                      id="profile-pic-upload"
                      className="hidden"
                      onChange={handleProfilePicChange}
                      accept="image/*"
                    />
                  </div>
                </div>
                
                {/* Upload button shown when a new file is selected */}
                {profilePicFile && (
                  <button
                    type="button"
                    onClick={handleProfilePicUpload}
                    disabled={isSubmitting}
                    className="mt-2 text-xs border-[1px] px-2 py-1 border-[#00ff0d] bg-[#00ff0d21] rounded-md text-red-600 hover:font-semibold"
                  >
                    {isSubmitting ? 'Uploading...' : 'Upload new picture'}
                  </button>
                )}
                
                <h2 className="mt-4 text-xl font-semibold text-gray-900">{formState.name}</h2>
                <p className="text-sm text-gray-500">{formState.email}</p>
                <p className="text-xs text-gray-400 mt-1">Your Donor ID: {formState.userId}</p>
              </div>
              
              {/* Profile completion */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm font-medium text-gray-700">{formState.profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-600" 
                    style={{ width: `${formState.profileCompletion}%` }}
                  ></div>
                </div>
                
                {profileCompletionItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {profileCompletionItems.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <ExclamationCircleIcon className="h-4 w-4 text-amber-500 mt-0.5 mr-1.5 flex-shrink-0" />
                        <button 
                          className="text-xs text-amber-700 hover:text-amber-800"
                          onClick={() => setActiveTab(item.section)}
                        >
                          {item.message}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'basic' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {formState.profileCompletionDetails?.basicInfo 
                    ? <CheckCircleIcon className="mr-3 h-5 w-5" /> 
                    : <span className="mr-3 h-5 w-5 text-gray-400 rounded-full border-2 border-gray-400"></span>}
                  Basic Information
                </button>
                
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'contact' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {formState.profileCompletionDetails?.contactInfo 
                    ? <CheckCircleIcon className="mr-3 h-5 w-5" /> 
                    : <span className="mr-3 h-5 w-5 text-gray-400 rounded-full border-2 border-gray-400"></span>}
                  Contact Information
                </button>
                
                <button
                  onClick={() => setActiveTab('medical')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'medical' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {formState.profileCompletionDetails?.medicalInfo 
                    ? <CheckCircleIcon className="mr-3 h-5 w-5" /> 
                    : <span className="mr-3 h-5 w-5 text-gray-400 rounded-full border-2 border-gray-400"></span>}
                  Medical Information
                </button>
                
                <button
                  onClick={() => setActiveTab('kyc')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'kyc' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {formState.profileCompletionDetails?.kycVerification 
                    ? <CheckCircleIcon className="mr-3 h-5 w-5" /> 
                    : formState.kycStatus === 'pending' 
                      ? <ClockIcon className="mr-3 h-5 w-5" />
                      : <span className="mr-3 h-5 w-5 text-gray-400 rounded-full border-2 border-gray-400"></span>}
                  KYC Verification
                </button>
                
                <button
                  onClick={() => setActiveTab('donation')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'donation' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Donation History
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'security' 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-blue-600' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Security & Logout
                </button>
              </nav>
              
              {/* Donation eligibility */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Next Eligible Donation (Yourself) </h3>
                <p className="mt-1 text-sm bg-[#13fc2e27] py-1 px-2 rounded-md border-[1px] border-[#13fc2e80] w-fit text-gray-900 font-semibold">{formState.nextEligibleDonation}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Based on your last donation - {formState.lastDonation}
                </div>
              </div>
              
              {/* Account info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">Account Information</h3>
                <p className="mt-1 text-xs text-gray-500">Member since {formState.accountCreated}</p>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-9">
            <div className="bg-white shadow-sm rounded-lg">
              {/* Basic Information Form */}
              {activeTab === 'basic' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                  <form onSubmit={handleBasicInfoSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField 
                        label="Full Name"
                        id="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        required
                        isCompleted={!!formState.name}
                      />
                      
                      <FormField 
                        label="Date of Birth"
                        id="dateOfBirth"
                        type="date"
                        value={formState.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        tooltipContent="Your date of birth helps us determine your donation eligibility."
                        isCompleted={!!formState.dateOfBirth}
                      />
                      
                      <FormField 
                        label="Gender"
                        id="gender"
                        type="select"
                        value={formState.gender}
                        onChange={handleInputChange}
                        required
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                        ]}
                        tooltipContent="Select your gender identity. This helps us provide relevant health information."
                        isCompleted={!!formState.gender}
                      />
                      
                      <FormField 
                        label="Blood Type"
                        id="bloodType"
                        type="select"
                        value={formState.bloodType}
                        onChange={handleInputChange}
                        required
                        options={[
                          { value: 'A+', label: 'A+' },
                          { value: 'A-', label: 'A-' },
                          { value: 'B+', label: 'B+' },
                          { value: 'B-', label: 'B-' },
                          { value: 'AB+', label: 'AB+' },
                          { value: 'AB-', label: 'AB-' },
                          { value: 'O+', label: 'O+' },
                          { value: 'O-', label: 'O-' },
                          { value: 'unknown', label: 'I don\'t know' }
                        ]}
                        tooltipContent="Your blood type is essential for donation matching."
                        isCompleted={!!formState.bloodType}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full md:w-auto px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                          isSubmitting 
                            ? 'bg-blue-300 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Contact Information Form */}
              {activeTab === 'contact' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                  <form onSubmit={handleContactInfoSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField 
                        label="Email"
                        id="email"
                        type="email"
                        value={formState.email}
                        readOnly
                        required
                        className='cursor-not-allowed'
                        disabled
                        isCompleted={!!formState.email}
                      />
                      
                      <FormField 
                        label="Phone Number"
                        id="phone"
                        type="tel"
                        value={formState.phone}
                        onChange={handleInputChange}
                        required
                        tooltipContent="We may need to contact you regarding your donations."
                        isCompleted={!!formState.phone}
                      />
                      
                      <FormField 
                        label="Street Address"
                        id="address.street"
                        value={formState.address.street}
                        onChange={handleInputChange}
                        required
                        isCompleted={!!formState.address.street}
                      />
                      
                      <FormField 
                        label="City"
                        id="address.city"
                        value={formState.address.city}
                        onChange={handleInputChange}
                        required
                        isCompleted={!!formState.address.city}
                      />
                      
                      <FormField 
                        label="State/Province"
                        id="address.state"
                        value={formState.address.state}
                        onChange={handleInputChange}
                        required
                        isCompleted={!!formState.address.state}
                      />
                      
                      <FormField 
                        label="Postal/ZIP Code"
                        id="address.postalCode"
                        value={formState.address.postalCode}
                        onChange={handleInputChange}
                        required
                        isCompleted={!!formState.address.postalCode}
                      />
                      
                      <FormField 
                        label="Country"
                        id="address.country"
                        value={formState.address.country}
                        onChange={handleInputChange}
                        required
                        isCompleted={!!formState.address.country}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full md:w-auto px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                          isSubmitting 
                            ? 'bg-blue-300 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Medical Information Form */}
              {activeTab === 'medical' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Information</h2>
                  <div className="mb-6 p-4 bg-blue-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 text-sm text-blue-700">
                        Your medical information helps us ensure safe donation experiences. This information is kept confidential.
                      </div>
                    </div>
                  </div>
                  <form onSubmit={handleMedicalInfoSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField 
                        label="Weight (kg)"
                        id="medicalInfo.weight"
                        type="number"
                        value={formState.medicalInfo.weight}
                        onChange={handleInputChange}
                        required
                        tooltipContent="Minimum weight requirements apply for blood donation."
                        isCompleted={!!formState.medicalInfo.weight}
                      />
                      
                      <FormField 
                        label="Height (cm)"
                        id="medicalInfo.height"
                        type="number"
                        value={formState.medicalInfo.height}
                        onChange={handleInputChange}
                        required
                        isCompleted={!!formState.medicalInfo.height}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField 
                          label="Allergies"
                          id="allergies"
                          type="textarea"
                          placeholder="List any allergies you have. If none, leave blank."
                          value={(formState.medicalInfo.allergies || []).join(', ')}
                          onChange={(e) => {
                            setFormState({
                              ...formState,
                              medicalInfo: {
                                ...formState.medicalInfo,
                                allergies: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                              }
                            });
                          }}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormField 
                          label="Current Medications"
                          id="medications"
                          type="textarea"
                          placeholder="List any medications you are currently taking. If none, leave blank."
                          value={(formState.medicalInfo.medications || []).join(', ')}
                          onChange={(e) => {
                            setFormState({
                              ...formState,
                              medicalInfo: {
                                ...formState.medicalInfo,
                                medications: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                              }
                            });
                          }}
                          tooltipContent="Some medications may affect donation eligibility."
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormField 
                          label="Medical Conditions"
                          id="conditions"
                          type="textarea"
                          placeholder="List any chronic or current medical conditions. If none, leave blank."
                          value={(formState.medicalInfo.conditions || []).join(', ')}
                          onChange={(e) => {
                            setFormState({
                              ...formState,
                              medicalInfo: {
                                ...formState.medicalInfo,
                                conditions: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                              }
                            });
                          }}
                          tooltipContent="Some medical conditions may affect donation eligibility."
                        />
                      </div>
                      
                      <FormField 
                        label="Last Medical Checkup"
                        id="medicalInfo.lastCheckup"
                        type="date"
                        value={formState.medicalInfo.lastCheckup}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full md:w-auto px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                          isSubmitting 
                            ? 'bg-blue-300 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* KYC Verification */}
              {activeTab === 'kyc' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">KYC Verification</h2>
                    {getKycStatusDisplay()}
                  </div>
                  
                  {formState.kycStatus === 'completed' ? (
                    <div>
                      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Verification Complete</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Your KYC verification has been completed and approved. Thank you for helping us maintain a safe donation platform.</p>
                            </div>
                            
                            {formState.kycDocuments.aadharCard && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-green-800">Verified Document</h4>
                                <div className="mt-2 border border-green-200 rounded-md overflow-hidden">
                                  <img 
                                    src={
                                      formState.kycDocuments?.aadharCard?.url || 
                                      formState.kycDocument?.url || 
                                      (typeof formState.kycDocuments?.aadharCard === 'string' ? formState.kycDocuments.aadharCard : null)
                                    } 
                                    alt="Aadhar Card" 
                                    className="w-full max-h-48 object-cover" 
                                   
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Need to update your documents?</h3>
                        <form onSubmit={handleSubmitKYC}>
                          <div className="space-y-6">
                            <div>
                              <FormField
                                label="Update Aadhar Card"
                                id="aadharCard"
                                type="file"
                                onChange={handleFileChange}
                                tooltipContent="If your Aadhar details have changed, you can upload an updated document here."
                              />
                            </div>
                            
                            {kycFile && (
                              <div className="flex items-center">
                                <input
                                  id="terms"
                                  name="terms"
                                  type="checkbox"
                                  required
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                  I confirm that the information provided is correct and authentic
                                </label>
                              </div>
                            )}
                            
                            {kycFile && (
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full md:w-auto px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                                  isSubmitting
                                    ? 'bg-blue-300 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                              >
                                {isSubmitting ? 'Submitting...' : 'Submit Updated Document'}
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : formState.kycStatus === 'pending' ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ClockIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Verification in Progress</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Your KYC verification is currently being reviewed by our team. This typically takes 1-2 business days.</p>
                          </div>
                          
                          
                          {(formState.kycDocuments?.aadharCard || formState.kycDocument?.url) && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-yellow-800">Submitted Document</h4>
                              <div className="mt-2 border border-yellow-200 rounded-md overflow-hidden">
                                <img 
                                  src={
                                    formState.kycDocuments?.aadharCard?.url || 
                                    formState.kycDocument?.url || 
                                    (typeof formState.kycDocuments?.aadharCard === 'string' ? formState.kycDocuments.aadharCard : null)
                                  }
                                  alt="Aadhar Card" 
                                  className="w-full max-h-48 object-cover"  
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : formState.kycStatus === 'rejected' ? (
                    <div>
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Verification Rejected</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>Your KYC verification has been rejected. Please ensure your document is clear, uncropped, and matches your profile information.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmitKYC}>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Upload your Aadhar Card</h3>
                            <FormField
                              label="Aadhar Card Image"
                              id="aadharCard"
                              type="file"
                              onChange={handleFileChange}
                              required
                              tooltipContent="Please upload a clear image of your Aadhar card. Make sure all details are visible."
                            />
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              required
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                              I confirm that the information provided is correct and authentic
                            </label>
                          </div>
                          
                          <button
                            type="submit"
                            disabled={isSubmitting || !kycFile}
                            className={`w-full md:w-auto px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                              isSubmitting || !kycFile
                                ? 'bg-blue-300 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <InfoIcon />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Why Verify Your Identity?</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>KYC verification helps us ensure the security and authenticity of our donation platform. Your information is kept confidential and secure.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmitKYC}>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Upload your Aadhar Card</h3>
                            <FormField
                              label="Aadhar Card Image"
                              id="aadharCard"
                              type="file"
                              onChange={handleFileChange}
                              required
                              tooltipContent="Please upload a clear image of your Aadhar card. Make sure all details are visible."
                            />
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              required
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                              I confirm that the information provided is correct and authentic
                            </label>
                          </div>
                          
                          <button
                            type="submit"
                            disabled={isSubmitting || !kycFile}
                            className={`w-full md:w-auto px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                              isSubmitting || !kycFile
                                ? 'bg-blue-300 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
              
              {/* Donation History */}
              {activeTab === 'donation' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Donation History</h2>

                  {/* Recent Completed Donations Card */}
                  {userDonations.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 mb-6 border border-green-100 shadow-sm">
                      <h3 className="text-lg font-medium text-green-800 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recent Completed Donations
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {userDonations
                          .filter(donation => donation.status === 'completed' || donation.status === 'Completed')
                          .slice(0, 3)
                          .map((donation, index) => (
                            <div key={donation.donationId || index} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    {donation.donationType === 'Blood' ? (
                                      <>🩸</>
                                    ) : donation.donationType === 'Organ' ? (
                                      <>🫀</>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="ml-2 font-medium text-gray-900">{donation.donationType} Donation</span>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Completed
                                </span>
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p><span className="font-medium">Date:</span> {new Date(donation.date).toLocaleDateString()}</p>
                                <p><span className="font-medium">Hospital:</span> {donation.preferredHospital || donation.location || 'N/A'}</p>
                                {donation.quantity && <p><span className="font-medium">Amount:</span> {donation.quantity} {donation.donationType === 'Blood' ? 'units' : ''}</p>}
                                <p><span className="font-medium">Certificate ID:</span> {donation.donationId}</p>
                              </div>
                            </div>
                          ))}
                        
                        {userDonations
                          .filter(donation => donation.status === 'completed' || donation.status === 'Completed')
                          .length === 0 && (
                            <div className="col-span-3 text-center py-4 text-gray-500">
                              No completed donations found.
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  
                  {userDonations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userDonations.map((donation, index) => (
                            <tr key={donation.donationId || index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {donation.date ? new Date(donation.date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {donation.donationType || 'N/A'}
                                {donation.donationSubType && ` (${donation.donationSubType})`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {donation.preferredHospital || donation.location || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {donation.quantity ? `${donation.quantity} units` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  (donation.status === 'Completed' || donation.status === 'completed')
                                    ? 'bg-green-100 text-green-800' 
                                    : (donation.status === 'approved')
                                      ? 'bg-blue-100 text-blue-800'
                                      : (donation.status === 'pending')
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {donation.status ? donation.status.charAt(0).toUpperCase() + donation.status.slice(1) : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by scheduling your first donation.</p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => Navigate('/donation/blood')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Schedule a Donation
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InfoIcon />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Donation Frequency</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Remember that blood can be donated every 3 months (whole blood). Your next eligible donation date is {formState.nextEligibleDonation || 'calculating...'}.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security & Logout Tab */}
              {activeTab === 'security' && (
                <div className="p-4 md:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Security & Account Access
                  </h2>
                  
                  <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 7h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                          <path d="M14 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
                        </svg>
                        Session Management
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Manage your account access and control your active sessions
                      </p>
                    </div>
                    
                    <div className="px-6 py-6 bg-gradient-to-b from-white to-gray-50">
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Logout Options
                        </h4>
                        <div className="space-y-6 md:space-y-4">
                          {/* Current Device Card */}
                          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                                      <rect x="9" y="9" width="6" height="6"></rect>
                                      <line x1="9" y1="2" x2="9" y2="4"></line>
                                      <line x1="15" y1="2" x2="15" y2="4"></line>
                                      <line x1="9" y1="20" x2="9" y2="22"></line>
                                      <line x1="15" y1="20" x2="15" y2="22"></line>
                                      <line x1="20" y1="9" x2="22" y2="9"></line>
                                      <line x1="20" y1="15" x2="22" y2="15"></line>
                                      <line x1="2" y1="9" x2="4" y2="9"></line>
                                      <line x1="2" y1="15" x2="4" y2="15"></line>
                                    </svg>
                                  </div>
                                  <h5 className="font-medium text-gray-900">Current Device</h5>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 ml-11">
                                  Log out from this device only. Your account will remain logged in on other devices.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to log out from this device?')) {
                                    logout(false);
                                  }
                                }}
                                className="flex-shrink-0 md:ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                  <polyline points="16 17 21 12 16 7"></polyline>
                                  <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Logout
                              </button>
                            </div>
                          </div>
                          
                          {/* All Devices Card */}
                          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className="bg-red-100 p-2 rounded-full mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                  </div>
                                  <h5 className="font-medium text-gray-900">All Devices</h5>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 ml-11">
                                  Log out from all devices where you're currently logged in. This is useful if you suspect unauthorized access to your account.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to log out from all devices? This will end all your active sessions.')) {
                                    logout(true);
                                  }
                                }}
                                className="flex-shrink-0 md:ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
                                  <circle cx="16" cy="12" r="3"></circle>
                                </svg>
                                Logout All Devices
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-4 mt-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-amber-800">
                              <strong>Security notice:</strong> Logging out from all devices will invalidate your current authentication token, requiring you to log in again.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Password Management Section */}
                    <div className="px-6 py-6 border-t border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Password Management</h4>
                          <p className="text-xs text-gray-600 mt-1">Change your password to keep your account secure</p>
                        </div>
                      </div>
                      
                      <form onSubmit={handlePasswordChange} className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        {passwordState.passwordError && (
                          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{passwordState.passwordError}</span>
                            </div>
                          </div>
                        )}
                        
                        {passwordState.passwordSuccess && (
                          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md relative" role="alert">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>{passwordState.passwordSuccess}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {/* Current Password */}
                          <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                              Current Password
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                              <input
                                type={passwordState.showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                id="current-password"
                                value={passwordState.currentPassword}
                                onChange={(e) => setPasswordState(prev => ({...prev, currentPassword: e.target.value}))}
                                className="block w-full rounded-md border-gray-300 border py-1.5 pl-3 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                required
                              />
                              {passwordState.currentPassword && passwordState.currentPassword.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setPasswordState(prev => ({...prev, showCurrentPassword: !prev.showCurrentPassword}))}
                                className="absolute inset-y-0 right-0 px-3 flex items-center bg-transparent border-0"
                              >
                                {passwordState.showCurrentPassword ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              )}
                            </div>
                          </div>
                          
                          {/* New Password */}
                          <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                              <input
                                type={passwordState.showNewPassword ? "text" : "password"}
                                name="newPassword"
                                id="new-password"
                                value={passwordState.newPassword}
                                onChange={(e) => setPasswordState(prev => ({...prev, newPassword: e.target.value}))}
                                className="block w-full rounded-md border-gray-300 border py-1.5 pl-3 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                required
                              />
                              {passwordState.newPassword && passwordState.newPassword.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setPasswordState(prev => ({...prev, showNewPassword: !prev.showNewPassword}))}
                                className="absolute inset-y-0 right-0 px-3 flex items-center bg-transparent border-0"
                              >
                                {passwordState.showNewPassword ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button> 
                              )}
                            </div>
                            
                            {passwordState.newPassword && passwordState.newPassword.length > 0 && (
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
                                    <span className={`mr-1 ${passwordState.newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}`}>
                                      {passwordState.newPassword.length >= 8 ? "✓" : "○"}
                                    </span>
                                    <span>At least 8 characters</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`mr-1 ${/[0-9]/.test(passwordState.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                                      {/[0-9]/.test(passwordState.newPassword) ? "✓" : "○"}
                                    </span>
                                    <span>At least one number</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`mr-1 ${/[!@#$%^&*]/.test(passwordState.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                                      {/[!@#$%^&*]/.test(passwordState.newPassword) ? "✓" : "○"}
                                    </span>
                                    <span>At least one special character (!@#$%^&*)</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`mr-1 ${/[A-Z]/.test(passwordState.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                                      {/[A-Z]/.test(passwordState.newPassword) ? "✓" : "○"}
                                    </span>
                                    <span>At least one uppercase letter</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`mr-1 ${/[a-z]/.test(passwordState.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                                      {/[a-z]/.test(passwordState.newPassword) ? "✓" : "○"}
                                    </span>
                                    <span>At least one lowercase letter</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Confirm Password */}
                          <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                              <input
                                type={passwordState.showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                id="confirm-password"
                                value={passwordState.confirmPassword}
                                onChange={(e) => setPasswordState(prev => ({...prev, confirmPassword: e.target.value}))}
                                className="block w-full rounded-md border-gray-300 border py-1.5 pl-3 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                required
                              />
                              {passwordState.confirmPassword && passwordState.confirmPassword.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setPasswordState(prev => ({...prev, showConfirmPassword: !prev.showConfirmPassword}))}
                                className="absolute inset-y-0 right-0 px-3 flex items-center bg-transparent border-0"
                              >
                                {passwordState.showConfirmPassword ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              )}
                            </div>
                            
                            {passwordState.newPassword && passwordState.newPassword.length > 0 && passwordState.confirmPassword && passwordState.confirmPassword.length > 0 && (
                              <div className="mt-1 flex items-center">
                                {passwordState.newPassword === passwordState.confirmPassword ? (
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
                          
                          {/* Logout Options */}
                          <div className="flex items-center mt-4">
                            <input
                              id="logout-all-devices"
                              name="logoutAllDevices"
                              type="checkbox"
                              checked={passwordState.logoutAllDevices}
                              onChange={(e) => setPasswordState(prev => ({...prev, logoutAllDevices: e.target.checked}))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="logout-all-devices" className="ml-2 block text-sm text-gray-700">
                              Logout from all devices after password change
                            </label>
                          </div>
                          
                          <div className="flex justify-end pt-4">
                            <button
                              type="submit"
                              disabled={passwordState.isSubmittingPassword}
                              className={`inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                passwordState.isSubmittingPassword ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              {passwordState.isSubmittingPassword ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                  Change Password
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
