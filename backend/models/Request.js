const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Blood Request', 'Organ Request', 'blood', 'organ', 'tissue', 'other']
  }, 
  subType: {
    type: String
  },
  userId: {
    type: String,
    required: true
  }, 
  userObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isForSelf: {
    type: Boolean,
    default: true
  },
  patientName: {
    type: String,
    required: function() {
      return this.isForSelf === false;
    }
  },
  recipientAge: String,
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function() {
      return this.type === 'Blood Request' || this.type === 'blood';
    }
  },
  organ: {
    type: String,
    required: function() {
      return this.type === 'organ';
    }
  },
  quantity: {
    type: Number,
    required: function() {
      return this.type === 'blood';
    },
    min: 1
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'normal', 'standard', 'elevated', 'urgent', 'emergency'],
    default: 'medium'
  },
  hospital: {
    name: String,
    address: String,
    phone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  requiredBy: {
    type: Date
  },
  medicalCertificate: String,
  medicalNotes: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'matched', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  rejectionReason: String,
  statusNotes: String,
   
  nearestHospital: String,
  medicalDetails: String,
  campaignRequired: Boolean,
  campaignDescription: String,
  campaignDate: Date,
   
  organType: String,
  doctorName: String,
  doctorContact: String,
  medicalCondition: String,
   
  fulfilledBy: [{
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    quantity: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
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
 
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
requestSchema.index({ type: 1 });
requestSchema.index({ requesterId: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ bloodType: 1 });
requestSchema.index({ urgency: 1 });
requestSchema.index({ requiredBy: 1 });

module.exports = mongoose.model('Request', requestSchema);
