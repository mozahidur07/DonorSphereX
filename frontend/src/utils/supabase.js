import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

export const uploadFile = async (file, folderName, userId, isKyc = false) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    

    const bucket = 'kyc';
    
    let fileName, fullPath;
    const fileExt = file.name.split('.').pop();
    
    if (isKyc) {
      const timestamp = Date.now();
      fileName = `${userId}_${timestamp}.${fileExt}`;
      fullPath = `users_kyc/${fileName}`;
      
      try {
        
        const { data: existingFiles, error: listError } = await supabase
          .storage
          .from(bucket)
          .list(`users_kyc`, {
            search: userId
          });
        
        if (listError) {
          console.warn('Error listing existing KYC files:', listError);
        } else {
          if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles
              .filter(file => file.name.startsWith(userId))
              .map(file => `users_kyc/${file.name}`);
              
            if (filesToRemove.length > 0) {
              
              const { data: deleteData, error: deleteError } = await supabase
                .storage
                .from(bucket)
                .remove(filesToRemove);
                
              if (deleteError) {
                console.warn('Error deleting existing KYC files:', deleteError);
              } 
            }
          }
        }
      } catch (deleteError) {
        console.warn('Exception while checking/deleting existing KYC file:', deleteError);
      }
    } else {
      fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      fullPath = folderName ? `${folderName}/${fileName}` : fileName;
    }
    
    const options = {
      cacheControl: '0',
      upsert: false, 
      contentType: file.type 
    };
    
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(fullPath, file, options);
      
    if (error) {

      if (error.message.includes('row-level security')) {
        console.error('RLS policy error details:', error);
        throw new Error('Permission denied: The application needs proper bucket permissions. Please check RLS policies.');
      }
      else if (error.message.includes('bucket')) {
        console.error('Bucket error details:', error);
        throw new Error(`Storage bucket '${bucket}' not found or inaccessible. Please check bucket configuration.`);
      }
      throw error;
    }
    
 
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(fullPath);
      
    return {
      success: true,
      data: {
        fileName: fileName,
        fullPath: fullPath,
        publicUrl: publicUrl
      }
    };
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    return {
      success: false,
      error: error.message || 'Error uploading file'
    };
  }
};
