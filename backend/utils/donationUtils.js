
const calculateNextEligibleDonation = (donationType, lastDonationDate) => {
  if (!lastDonationDate) return new Date(); 
  
  const lastDonation = new Date(lastDonationDate);
  const nextEligible = new Date(lastDonation);
  
  switch (donationType.toLowerCase()) {
    case 'blood':
      // Blood donation: 56 days (8 weeks) waiting period
      nextEligible.setDate(lastDonation.getDate() + 56);
      break;
    case 'platelet':
      // Platelet donation: 7 days waiting period
      nextEligible.setDate(lastDonation.getDate() + 7);
      break;
    case 'plasma':
      // Plasma donation: 28 days waiting period
      nextEligible.setDate(lastDonation.getDate() + 28);
      break;
    case 'organ':
      // Organ donation is typically one-time (living donor) or posthumous
      // Set to a far future date to indicate not eligible again
      nextEligible.setFullYear(nextEligible.getFullYear() + 100);
      break;
    case 'tissue':
      // Tissue donation varies, default to 6 months
      nextEligible.setMonth(nextEligible.getMonth() + 6);
      break;
    default:
      // Default: 56 days for unknown types
      nextEligible.setDate(lastDonation.getDate() + 56);
      break;
  }
  
  return nextEligible;
};


const checkDonationEligibility = (donationType, lastDonationDate) => {
  const nextEligibleDate = calculateNextEligibleDonation(donationType, lastDonationDate);
  const today = new Date();
  
  return {
    isEligible: today >= nextEligibleDate,
    nextEligibleDate: nextEligibleDate,
    daysUntilEligible: Math.max(0, Math.ceil((nextEligibleDate - today) / (1000 * 60 * 60 * 24)))
  };
};


const generateDonationId = (type) => {
  const timestamp = Date.now();
  const typePrefix = type.substring(0, 3).toUpperCase();
  return `${typePrefix}-${timestamp}`;
};

module.exports = {
  calculateNextEligibleDonation,
  checkDonationEligibility,
  generateDonationId
};