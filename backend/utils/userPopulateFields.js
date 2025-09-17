 

const USER_POPULATE_FIELDS = [
  'userId',
  'name', 
  'fullName',
  'email',
  'phone',
  'dateOfBirth',
  'bloodType',
  'gender',
  'address',
  'medicalInfo',
  'emergencyContact',
  'kycStatus',
  'kycDocument',
  'kycDocuments',
  'profile_completed',
  'profileCompletion',
  'profileCompletionDetails',
  'isVerified',
  'staff_approval',
  'status',
  'role',
  'donationHistory',
  'lastDonation',
  'nextEligibleDonation',
  'profilePicture',
  'createdAt',
  'updatedAt',
  'lastLogin',
  'loginIPs'
].join(' ');

 
const USER_BASIC_FIELDS = [
  'userId',
  'name',
  'fullName', 
  'email',
  'phone',
  'bloodType',
  'status',
  'role'
].join(' ');

module.exports = {
  USER_POPULATE_FIELDS,
  USER_BASIC_FIELDS
};