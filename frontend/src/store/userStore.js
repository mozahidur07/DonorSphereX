import { create } from 'zustand';
import axios from 'axios';
import { uploadFile } from '../utils/supabase';
import api, { apiGet, apiPost, apiPut } from '../utils/api';

const useUserStore = create((set, get) => ({
  userData: {
    address: {},
    medicalInfo: {},
    profileCompletionDetails: {
      basicInfo: false,
      contactInfo: false,
      medicalInfo: false,
      kycVerification: false
    },
    kycStatus: 'not_submitted',
    kycDocuments: {},
    profileCompletion: 0,
    donationHistory: []
  },
  isLoading: false,
  error: null,
  
  fetchUserData: async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      set({ 
        userData: {
          address: {},
          medicalInfo: {},
          profileCompletionDetails: {
            basicInfo: false,
            contactInfo: false,
            medicalInfo: false,
            kycVerification: false
          },
          kycStatus: 'not_submitted',
          kycDocuments: {},
          profileCompletion: 0,
          donationHistory: []
        }, 
        error: 'No authentication token found' 
      });
      return null;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const cacheBuster = `?_=${Date.now()}`;
      
      const response = await apiGet(`profile${cacheBuster}`, {
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.data.status === 'success') {
        set({ 
          userData: response.data.data,
          isLoading: false 
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      set({ 
        error: error.message || 'Error fetching user data', 
        isLoading: false 
      });
      return null;
    }
  },
   
  updateUserData: async (profileData) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      set({ error: 'No authentication token found' });
      return { success: false, error: 'No authentication token found' };
    }
    
    set({ isLoading: true, error: null });
    
    try { 
      const sanitizedData = { ...profileData };
       
      if (sanitizedData.profileCompletionDetails) {
        delete sanitizedData.profileCompletionDetails;
      }
       
      if (sanitizedData.dateOfBirth && typeof sanitizedData.dateOfBirth === 'string') {
        if (!sanitizedData.dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const date = new Date(sanitizedData.dateOfBirth);
          if (!isNaN(date.getTime())) {
            sanitizedData.dateOfBirth = date.toISOString().split('T')[0];
          }
        }
      }
       
      if (sanitizedData.medicalInfo?.lastCheckup) {
        if (typeof sanitizedData.medicalInfo.lastCheckup === 'string' && 
            !sanitizedData.medicalInfo.lastCheckup.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const date = new Date(sanitizedData.medicalInfo.lastCheckup);
          if (!isNaN(date.getTime())) {
            sanitizedData.medicalInfo.lastCheckup = date.toISOString().split('T')[0];
          }
        }
      }
      
      console.log("Sending profile update:", JSON.stringify(sanitizedData, null, 2));
      
      const response = await apiPut('profile/update', sanitizedData);
      
      if (response.data.status === 'success') {
        console.log("Profile update success:", JSON.stringify(response.data.data, null, 2));
         
        set({ 
          userData: { 
            ...get().userData, 
            ...response.data.data 
          },
          isLoading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to update user data');
      }
    } catch (error) {
      console.error("Profile update error:", error);
      
      let errorMessage = 'Error updating user data';
       
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        console.error("Server error details:", error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },
   
  uploadProfilePicture: async (imageFile) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      set({ error: 'No authentication token found' });
      return { success: false, error: 'No authentication token found' };
    }
    
    set({ isLoading: true, error: null });
    
    try { 
      const userData = get().userData;
      const userId = userData?._id;
      
      if (!userId) {
        throw new Error('User ID not found. Please reload the page.');
      }
       
      const uploadResult = await uploadFile(
        imageFile, 
        'profile-pictures',
        userId,
        false  
      );
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload to Supabase');
      }
       
      const response = await apiPut('profile/update', 
        { 
          profilePicture: {
            url: uploadResult.data.publicUrl,
            filename: uploadResult.data.fileName,
            path: uploadResult.data.fullPath,
            uploadedAt: new Date().toISOString()
          }
        }
      );
      
      if (response.data.status === 'success') { 
        set({ 
          userData: { 
            ...get().userData, 
            profilePicture: {
              url: uploadResult.data.publicUrl,
              filename: uploadResult.data.fileName,
              path: uploadResult.data.fullPath,
              uploadedAt: new Date().toISOString()
            }
          },
          isLoading: false 
        });
        
        return { 
          success: true, 
          data: {
            profilePicture: {
              url: uploadResult.data.publicUrl,
              filename: uploadResult.data.fileName,
              path: uploadResult.data.fullPath
            }
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to update profile with picture URL');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      set({ 
        error: error.message || 'Error uploading profile picture', 
        isLoading: false 
      });
      return { 
        success: false, 
        error: error.message || 'Error uploading profile picture' 
      };
    }
  },
   
  uploadKycDocument: async (kycFile) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      set({ error: 'No authentication token found' });
      return { success: false, error: 'No authentication token found' };
    }
    
    set({ isLoading: true, error: null });
    
    try { 
      const userData = get().userData;
      const userId = userData?._id;
      
      if (!userId) {
        throw new Error('User ID not found. Please reload the page.');
      }
       
      const uploadResult = await uploadFile(
        kycFile, 
        'kyc',
        userId,
        true
      );
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload to Supabase');
      }
      
      console.log("Calling dedicated KYC update endpoint with URL:", uploadResult.data.publicUrl);
      
      const cacheBustedUrl = `${uploadResult.data.publicUrl}?t=${Date.now()}`;
      console.log("Cache-busted URL:", cacheBustedUrl);
      
      const response = await apiPost('profile/update-kyc', 
        { 
          documentUrl: cacheBustedUrl,
          fileName: uploadResult.data.fileName,
          filePath: uploadResult.data.fullPath,
          originalName: kycFile.name,
          mimetype: kycFile.type,
          size: kycFile.size
        }
      );
      
      if (response.data.status === 'success') { 
        const documentData = {
          url: uploadResult.data.publicUrl,
          filename: uploadResult.data.fileName,
          path: uploadResult.data.fullPath,
          originalName: kycFile.name,
          mimetype: kycFile.type,
          size: kycFile.size,
          uploadedAt: new Date().toISOString()
        };
         
        console.log("Backend response after KYC upload:", JSON.stringify(response.data, null, 2));
         
        const updatedUserData = { 
          ...get().userData, 
          kycStatus: 'pending', 
          kycDocument: documentData,
          kycDocuments: {
            ...(get().userData?.kycDocuments || {}),
            aadharCard: { url: documentData.url }
          }
        };
        
        console.log("Updating userData in store with:", JSON.stringify({
          kycStatus: updatedUserData.kycStatus,
          kycDocument: updatedUserData.kycDocument,
          kycDocuments: updatedUserData.kycDocuments
        }, null, 2));
        
        set({ 
          userData: updatedUserData,
          isLoading: false 
        });
        
        return { 
          success: true, 
          data: {
            kycStatus: 'pending',
            kycDocument: {
              url: uploadResult.data.publicUrl,
              filename: uploadResult.data.fileName,
              path: uploadResult.data.fullPath
            }, 
            publicUrl: uploadResult.data.publicUrl
          }
        };
      } else {
        throw new Error(response.data.message || 'Failed to update profile with KYC document');
      }
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      set({ 
        error: error.message || 'Error uploading KYC document', 
        isLoading: false 
      });
      return { 
        success: false, 
        error: error.message || 'Error uploading KYC document' 
      };
    }
  },
   
  clearUserData: () => set({ 
    userData: {
      address: {},
      medicalInfo: {},
      profileCompletionDetails: {
        basicInfo: false,
        contactInfo: false,
        medicalInfo: false,
        kycVerification: false
      },
      kycStatus: 'not_submitted',
      kycDocuments: {},
      profileCompletion: 0,
      donationHistory: []
    }, 
    error: null 
  }),
}));

export default useUserStore;
