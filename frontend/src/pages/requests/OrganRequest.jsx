import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { hospitals, searchHospitals } from '../../data/hospitals';

const organTypes = [
  'Kidney',
  'Liver',
  'Heart',
  'Lung',
  'Pancreas',
  'Small Intestine',
  'Cornea',
  'Bone Marrow',
  'Tissue',
  'Other'
];

const OrganRequest = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    requestId: `RORG-${uuidv4().slice(0, 8).toUpperCase()}`,
    organType: '',
    bloodType: '',
    urgency: 'Standard',
    isForSelf: true,
    recipientType: 'Self',
    patientName: '',
    recipientAge: '',
    location: '',
    nearestHospital: '',
    doctorName: '',
    doctorContact: '',
    medicalCondition: '',
    additionalNotes: '',
    status: 'pending',
    type: 'Organ Request',
    createdAt: new Date(),
  });

  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState([]);

  // Set a new request ID when component mounts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      requestId: `RORG-${uuidv4().slice(0, 8).toUpperCase()}`
    }));
  }, []);

  // Hospital search functionality
  useEffect(() => {
    if (hospitalSearch) {
      const filtered = searchHospitals(hospitalSearch);
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [hospitalSearch]);

  // Click outside handler for hospital dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.hospital-dropdown-container')) {
        setShowHospitalDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHospitalSelect = (hospital) => {
    setFormData(prev => ({ ...prev, nearestHospital: hospital }));
    setHospitalSearch(hospital);
    setShowHospitalDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for recipient type to set isForSelf
    if (name === 'recipientType') {
      setFormData({
        ...formData,
        recipientType: value,
        isForSelf: value === 'Self',
        // Clear patientName if self is selected
        ...(value === 'Self' && { patientName: '' })
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setSubmitMessage({
        type: 'error',
        message: 'Please sign in to submit an organ request'
      });
      return;
    }
    
    setIsLoading(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      // Based on the Request.js model, create a request that matches the schema exactly
      const requestData = {
        requestId: formData.requestId,
        type: "organ", // Must match the enum values in the schema
        organ: formData.organType,  // Required for organ requests
        bloodType: formData.bloodType,
        urgency: formData.urgency.toLowerCase(),
        isForSelf: Boolean(formData.isForSelf),
        patientName: !formData.isForSelf ? formData.patientName : undefined,
        recipientAge: formData.recipientAge ? formData.recipientAge.toString() : "",
        location: formData.location || "",
        nearestHospital: formData.nearestHospital,
        doctorName: formData.doctorName,
        doctorContact: formData.doctorContact,
        medicalCondition: formData.medicalCondition,
        medicalNotes: formData.additionalNotes || "",
        status: "pending",
        subType: "Organ Request"
      };
       
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${API_URL}/requests`, requestData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.data.status === 'success') {
        setSubmitMessage({
          type: 'success',
          message: 'Organ request submitted successfully! Your reference ID is: ' + formData.requestId
        });
        
        // Reset form
        setFormData({
          requestId: `RORG-${uuidv4().slice(0, 8).toUpperCase()}`,
          organType: '',
          bloodType: '',
          urgency: 'Standard',
          isForSelf: true,
          patientName: '',
          recipientAge: '',
          location: '',
          nearestHospital: '',
          doctorName: '',
          doctorContact: '',
          medicalCondition: '',
          additionalNotes: '',
          status: 'pending',
          type: 'Organ Request',
          createdAt: new Date(),
        });
      } else {
        throw new Error(response.data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Error submitting organ request:', err);
      
      // Log more detailed error information
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      
      let errorMessage = 'Failed to submit your request. Please try again later.';
      
      if (err.response?.data?.message) {
        errorMessage = `Server error: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      // Check specifically for "b is not defined" error
      if (err.message?.includes('b is not defined')) {
        errorMessage = 'There is a problem with the form data. Please check all fields and try again.';
        console.error('Detected "b is not defined" error - likely an issue with data formatting');
      }
      
      setSubmitMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Organ Request Form</h1>
            <p className="text-green-100 mt-1">
              Please provide details for your organ transplant request
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
             {/* Reference ID */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-500">
                  <strong>Request Reference ID:</strong> <span className='font-bold bg-green-100 text-black border-[1px] rounded-md border-green-300 px-2 py-1'> {formData.requestId} </span> 
                  <span className="ml-2 text-xs">(Keep this ID to track your request status)</span>
                </p>
              </div>
            </div>
            {/* Organ Type & Blood Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="organType" className="block text-sm font-medium text-gray-700 mb-1">
                  Organ Type Required*
                </label>
                <select
                  id="organType"
                  name="organType"
                  value={formData.organType}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                >
                  <option value="">Select Organ Type</option>
                  {organTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Blood Type*
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Urgency & Recipient Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Level*
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                >
                  <option value="Standard">Standard (Stable condition)</option>
                  <option value="Elevated">Elevated (Condition worsening)</option>
                  <option value="Urgent">Urgent (Critical condition)</option>
                  <option value="Emergency">Emergency (Life-threatening)</option>
                </select>
              </div>

              <div>
                <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient*
                </label>
                <select
                  id="recipientType"
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                >
                  <option value="Self">Self</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Patient Name (when not for self) */}
            {!formData.isForSelf && (
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name*
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter the patient's full name"
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>
            )}

            {/* Recipient Age */}
            <div>
              <label htmlFor="recipientAge" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Age*
              </label>
              <input
                type="number"
                id="recipientAge"
                name="recipientAge"
                value={formData.recipientAge}
                onChange={handleChange}
                required
                min="0"
                max="120"
                className="max-w-xs block rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
              />
            </div>

            {/* Location & Hospital */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Location*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter your city/area"
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>

              <div className="hospital-dropdown-container relative">
                <label htmlFor="nearestHospital" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Transplant Center*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nearestHospital"
                    name="nearestHospital"
                    value={hospitalSearch}
                    onChange={(e) => {
                      setHospitalSearch(e.target.value);
                      setShowHospitalDropdown(true);
                    }}
                    onFocus={() => setShowHospitalDropdown(true)}
                    required
                    placeholder="Search for transplant center..."
                    className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none pr-8"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {showHospitalDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredHospitals.length > 0 ? (
                        filteredHospitals.map((hospital, index) => (
                          <div
                            key={index}
                            onClick={() => handleHospitalSelect(hospital)}
                            className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          >
                            {hospital}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No transplant centers found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor's Name*
                </label>
                <input
                  type="text"
                  id="doctorName"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  required
                  placeholder="Dr. Full Name"
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>

              <div>
                <label htmlFor="doctorContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor's Contact*
                </label>
                <input
                  type="text"
                  id="doctorContact"
                  name="doctorContact"
                  value={formData.doctorContact}
                  onChange={handleChange}
                  required
                  placeholder="Phone or Email"
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>
            </div>

            {/* Medical Condition */}
            <div>
              <label htmlFor="medicalCondition" className="block text-sm font-medium text-gray-700 mb-1">
                Medical Condition Details*
              </label>
              <textarea
                id="medicalCondition"
                name="medicalCondition"
                value={formData.medicalCondition}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Describe the medical condition requiring organ transplant"
                className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={2}
                placeholder="Any additional information that might be relevant"
                className="block w-full rounded-md py-1 px-2 bg-[#c3c3c354] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
              />
            </div>

           

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Submit Request'}
              </button>
            </div>
            
            {/* Success/Error Message */}
            {submitMessage.message && (
              <div className={`mt-4 p-4 rounded-md ${submitMessage.type === 'success' ? 'bg-green-50 border-l-4 border-green-400' : 'bg-red-50 border-l-4 border-red-400'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {submitMessage.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${submitMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{submitMessage.message}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganRequest;
