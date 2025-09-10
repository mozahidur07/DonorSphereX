import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const organTypes = [
  'Kidney',
  'Liver (Partial)',
  'Bone Marrow',
  'Tissue',
  'Cornea',
  'Other'
];

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const hospitals = [
  'National Organ Transplant Center',
  'City General Hospital',
  'University Medical Center',
  'Regional Transplant Institute',
  'Memorial Hospital',
  'Children\'s Hospital',
  'Veterans Hospital',
];

const OrganDonation = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    donationId: uuidv4(),
    organType: '',
    bloodType: '',
    age: '',
    weight: '',
    height: '',
    hasChronicIllness: false,
    chronicIllnessDetails: '',
    hasMedicalCondition: false,
    medicalConditionDetails: '',
    location: '',
    preferredHospital: '',
    contactNumber: '',
    emergencyContact: '',
    relationship: '',
    donationType: 'Living',
    isForSelf: true,
    patientName: '',
    additionalNotes: '',
    status: 'pending',
  });

  // Set a new donation ID when component mounts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      donationId: `ORG-${uuidv4().slice(0, 8).toUpperCase()}`
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        message: 'You must be logged in to submit a donation application.' 
      });
      window.scrollTo(0, 0);
      return;
    }
    
    setIsLoading(true);
    setSubmitMessage({ type: '', message: '' });

    try {
      // Store the donation ID for reference
      const donationRefId = formData.donationId;
      
      // Create the donation data with user info
      const donationData = {
        ...formData,
        userId: currentUser.userId,
        userName: currentUser.fullName || currentUser.name,
        userEmail: currentUser.email,
        donationType: 'Organ',
        donationSubType: formData.organType,
        date: new Date().toISOString(),
        location: formData.preferredHospital
      };

      // Save to MongoDB
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      // Remove any userId field from the form data - backend will use the authenticated user
      if (donationData.userId) {
        delete donationData.userId;
      }
      
      
      const response = await axios.post(`${API_URL}/donations`, donationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        // Reset form
        setFormData({
          ...formData,
          donationId: `ORG-${uuidv4().slice(0, 8).toUpperCase()}`,
          organType: '',
          bloodType: '',
          age: '',
          weight: '',
          height: '',
          hasChronicIllness: false,
          chronicIllnessDetails: '',
          hasMedicalCondition: false,
          medicalConditionDetails: '',
          location: '',
          preferredHospital: '',
          contactNumber: '',
          emergencyContact: '',
          relationship: '',
          donationType: 'Living',
          isForSelf: true,
          patientName: '',
          additionalNotes: '',
          status: 'pending',
        });
        setSubmitMessage({ 
          type: 'success', 
          message: `Organ donation application submitted successfully! Your donation ID is: ${donationRefId}. You can track the status of your donation in your report page.` 
        });
      } else {
        setSubmitMessage({ 
          type: 'error', 
          message: 'There was an error submitting your application. Please try again.' 
        });
      }
    } catch (error) {
      console.error("Error submitting donation form:", error);
      let errorMessage = 'Server error. Please try again later.';
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Invalid form data. Please check your inputs.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Our team has been notified. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setSubmitMessage({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Organ Donation Form</h1>
            <p className="text-green-100 mt-1">
              Thank you for considering organ donation. Please complete the form below.
            </p>
          </div>

          {/* Form */}
          {/* Success/Error Message */}
          {submitMessage.message && (
            <div className={`p-4 rounded-md ${submitMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {submitMessage.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={submitMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {submitMessage.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Donation ID (Read-only) */}
            <div>
              <label htmlFor="donationId" className="block text-sm font-medium text-gray-700 mb-1">
                Donation Reference ID
              </label>
              <input
                type="text"
                id="donationId"
                name="donationId"
                value={formData.donationId}
                readOnly
                className="block w-full max-w-lg rounded-md py-1 px-2 bg-gray-100 border-[1px] border-gray-300 shadow-sm focus:border-none text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">This is your unique donation reference number.</p>
            </div>
          
            {/* Who is this donation for? */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Who is this donation for?</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    id="isForSelfYes"
                    name="isForSelf"
                    type="radio"
                    checked={formData.isForSelf === true}
                    onChange={() => setFormData({...formData, isForSelf: true, patientName: ''})}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                  />
                  <label htmlFor="isForSelfYes" className="ml-3 block text-sm font-medium text-gray-700">
                    Self (I am the donor)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="isForSelfNo"
                    name="isForSelf"
                    type="radio"
                    checked={formData.isForSelf === false}
                    onChange={() => setFormData({...formData, isForSelf: false})}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                  />
                  <label htmlFor="isForSelfNo" className="ml-3 block text-sm font-medium text-gray-700">
                    Other Person (I am registering on behalf of someone)
                  </label>
                </div>
              </div>
              
              {formData.isForSelf === false && (
                <div className="mt-4">
                  <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient's Name*
                  </label>
                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required={!formData.isForSelf}
                    placeholder="Enter patient's full name"
                    className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                  />
                </div>
              )}
            </div>
            
            {/* Donation Type */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Donation Type</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    id="livingDonor"
                    name="donationType"
                    type="radio"
                    value="Living"
                    checked={formData.donationType === 'Living'}
                    onChange={handleChange}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                  />
                  <label htmlFor="livingDonor" className="ml-3 block text-sm font-medium text-gray-700">
                    Living Donor
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="deceasedDonor"
                    name="donationType"
                    type="radio"
                    value="Deceased"
                    checked={formData.donationType === 'Deceased'}
                    onChange={handleChange}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                  />
                  <label htmlFor="deceasedDonor" className="ml-3 block text-sm font-medium text-gray-700">
                    Deceased Donor (After Death)
                  </label>
                </div>
              </div>
            </div>
            
            {/* Organ Type & Blood Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="organType" className="block text-sm font-medium text-gray-700 mb-1">
                  Organ Type to Donate*
                </label>
                <select
                  id="organType"
                  name="organType"
                  value={formData.organType}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
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
                  Blood Type*
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="unknown">I don't know</option>
                </select>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age*
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="18"
                  max="70"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)*
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  min="40"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)*
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  min="140"
                  max="220"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="hasChronicIllness"
                    name="hasChronicIllness"
                    type="checkbox"
                    checked={formData.hasChronicIllness}
                    onChange={handleChange}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="hasChronicIllness" className="font-medium text-gray-700">
                    Do you have any chronic illnesses?
                  </label>
                </div>
              </div>

              {formData.hasChronicIllness && (
                <div className="ml-7">
                  <label htmlFor="chronicIllnessDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify chronic illnesses
                  </label>
                  <textarea
                    id="chronicIllnessDetails"
                    name="chronicIllnessDetails"
                    value={formData.chronicIllnessDetails}
                    onChange={handleChange}
                    required={formData.hasChronicIllness}
                    rows={2}
                    className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                  />
                </div>
              )}

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="hasMedicalCondition"
                    name="hasMedicalCondition"
                    type="checkbox"
                    checked={formData.hasMedicalCondition}
                    onChange={handleChange}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="hasMedicalCondition" className="font-medium text-gray-700">
                    Do you have any current medical conditions or are you taking medications?
                  </label>
                </div>
              </div>

              {formData.hasMedicalCondition && (
                <div className="ml-7">
                  <label htmlFor="medicalConditionDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify conditions/medications
                  </label>
                  <textarea
                    id="medicalConditionDetails"
                    name="medicalConditionDetails"
                    value={formData.medicalConditionDetails}
                    onChange={handleChange}
                    required={formData.hasMedicalCondition}
                    rows={2}
                    className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                  />
                </div>
              )}
            </div>

            {/* Location */}
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
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>

              <div>
                <label htmlFor="preferredHospital" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Transplant Center*
                </label>
                <select
                  id="preferredHospital"
                  name="preferredHospital"
                  value={formData.preferredHospital}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                >
                  <option value="">Select Hospital/Transplant Center</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital} value={hospital}>
                      {hospital}
                    </option>
                  ))}
                  <option value="other">Other (Specify in additional notes)</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number*
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter your contact number"
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>

              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact*
                </label>
                <input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                  placeholder="Enter emergency contact number"
                  className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to Emergency Contact*
              </label>
              <input
                type="text"
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                required
                placeholder="e.g., Spouse, Parent, Child, Friend"
                className="block w-full max-w-lg rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
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
                rows={3}
                placeholder="Any additional information you'd like to provide"
                className="block w-full rounded-md py-1 px-2 bg-[#c3c3c327] border-[1px] border-[#c3c3c3b0] shadow-sm focus:border-none"
              />
            </div>

            {/* Consent */}
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    required
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="consent" className="font-medium text-gray-700">
                    I consent to donate my organs as specified above
                  </label>
                  <p className="text-gray-500">
                    I understand that this is an initial application and I will need to undergo medical evaluation before donation. I also understand that I can withdraw my consent at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganDonation;
