const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: function() {
      // Generate ID
      const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
      return `LD-${randomNum}`;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    donor: {
      type: Boolean,
      default: false
    },
    staff: {
      type: Boolean,
      default: false
    },
    admin: {
      type: Boolean,
      default: false
    }
  },
  staff_approval: {
    type: Boolean,
    default: false
  },
  profile_completed: {
    type: Boolean,
    default: false
  },
  profileCompletion: {
    type: Number,
    default: 0
  },
  profileCompletionDetails: {
    basicInfo: {
      type: Boolean,
      default: false
    },
    contactInfo: {
      type: Boolean,
      default: false
    },
    medicalInfo: {
      type: Boolean,
      default: false
    },
    kycVerification: {
      type: Boolean,
      default: false
    }
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'completed', 'rejected'],
    default: 'not_submitted'
  },
  kycDocument: {
    filename: String,
    originalName: String,
    mimetype: String,
    path: String,
    url: String,
    size: Number,
    uploadedAt: Date,
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }, 
  kycDocuments: {
    aadharCard: {
      url: String
    }
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say', 'prefer not to say']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  medicalInfo: {
    height: Number,
    weight: Number,
    allergies: [String],
    medications: [String],
    conditions: [String],
    lastCheckup: Date
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  donationHistory: [{
    donationId: String,
    type: String,  
    subType: String,  
    date: {
      type: Date,
      default: Date.now
    },
    hospital: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    statusDate: {
      type: Date,
      default: Date.now
    }
  }],
  lastDonation: {
    type: Date
  },
  nextEligibleDonation: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    filename: String,
    originalName: String,
    mimetype: String,
    path: String,
    url: String,
    size: Number,
    uploadedAt: Date
  },
  lastLogin: Date,
  loginIPs: [{
    ip: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  jwt_version: {
    type: String,
    default: crypto.randomBytes(16).toString('hex')
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  notifications: [{
    id: {
      type: String,
      default: function() { 
        return crypto.randomBytes(8).toString('hex');
      }
    },
    message: {
      type: String,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    },
    from: {
      type: String,
      default: 'System',
      enum: ['System', 'Staff', 'Admin']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['welcome', 'reminder', 'success', 'verification', 'approval', 'urgent', 'appreciation', 'event'],
      required: true
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
 
userSchema.pre('save', async function(next) {
 
  this.updatedAt = Date.now();
   
  if (this.isModified('kycDocument') || this.isModified('kycDocuments') || this.isModified('kycStatus')) {
    console.log('Saving user with KYC updates:');
    console.log('kycStatus:', this.kycStatus);
    console.log('kycDocument:', this.kycDocument);
    console.log('kycDocuments:', this.kycDocuments);
     
    if (this.kycDocument && this.kycDocument.url) {
      this.kycDocuments = this.kycDocuments || {};
      this.kycDocuments.aadharCard = this.kycDocuments.aadharCard || {};
      this.kycDocuments.aadharCard.url = this.kycDocument.url;
      
      console.log('Synchronized kycDocuments with kycDocument URL:', this.kycDocuments);
    }
     
    if (this.kycDocument && this.kycDocument.url && this.kycStatus === 'not_submitted') {
      console.log('Setting kycStatus to pending because document exists');
      this.kycStatus = 'pending';
    }
  }
   
  if (this.isNew || this.isModified('userId')) {
    const User = this.constructor;
    const existingUser = await User.findOne({ userId: this.userId });
    
    if (existingUser && !this._id.equals(existingUser._id)) {
     
      const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
      this.userId = `LD-${randomNum}`;
    }
  }
   
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});
 
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
 
userSchema.methods.addLoginIP = function(ip) { 
  this.loginIPs.unshift({ 
    ip: ip,
    timestamp: new Date()
  });
   
  if (this.loginIPs.length > 5) {
    this.loginIPs = this.loginIPs.slice(0, 5);
  }
   
  this.lastLogin = new Date();
   
  return this.loginIPs.length === 1 || 
    this.loginIPs.slice(1).findIndex(entry => entry.ip === ip) === -1;
};
 
userSchema.methods.resetJWTVersion = function() {
  this.jwt_version = crypto.randomBytes(16).toString('hex');
  return this.jwt_version;
};
  

module.exports = mongoose.model('User', userSchema, 'users');
