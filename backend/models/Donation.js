const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donationId: {
    type: String,
    required: true,
    unique: true
  }, 
  donationType: {
    type: String,
    required: true,
    enum: ['Blood', 'Organ', 'Tissue', 'Other']
  },
  donationSubType: {
    type: String
  },
   
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
   
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
  },
  age: {
    type: Number
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
   
  isForSelf: {
    type: Boolean,
    default: true
  },
  patientName: {
    type: String
  },
  organType: String,
  quantity: Number,
   
  hasChronicIllness: {
    type: Boolean,
    default: false
  },
  chronicIllnessDetails: String,
  hasMedicalCondition: {
    type: Boolean,
    default: false
  },
  medicalConditionDetails: String,
   
  contactNumber: String,
  emergencyContact: String,
  relationship: String, 
  location: {
    type: String,
    required: true
  },
  preferredHospital: String, 
  additionalNotes: String,
   
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  statusNotes: String,
  
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
 
donationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
donationSchema.index({ donationType: 1 });
donationSchema.index({ userId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ date: 1 });
donationSchema.index({ donationId: 1 }, { unique: true });

module.exports = mongoose.model('Donation', donationSchema);
