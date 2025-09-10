// WebsiteContext.js
// This file contains structured information about the website for AI context

export const websiteStructure = {
  name: "Life Donner",
  description: "A blood and organ donation platform that connects donors with recipients",
  email: "support@lifedonner.com",
  phone: "+91 7074252487",
  address: "126, Ram Bagan, Kolkata, West Bengal 700006",
  routes: {
    home: "/",
    about: "/about",
    bloodDonation: "/donation/blood",
    organDonation: "/donation/organ",
    requests: "/status",
    bloodRequest: "/requests/blood",
    organRequest: "/requests/organ",
    profile: "/profile",
    notifications: "/notifications",
    support: "/support",
    dashboard: "/dashboard",
    donationReports: "/donation/reports",
    termsOfService: "/terms",
    privacyPolicy: "/privacy",
    signIn: "/signin",
    signUp: "/signup",
  },
  features: [
    "Blood donation registration and scheduling",
    "Organ donation registration",
    "Emergency blood requests",
    "Organ transplant requests",
    "Donation history tracking",
    "Medical eligibility checks",
    "Donation center locator",
    "Real-time notifications",
    "Donor-recipient matching",
    "Community support network",
  ],
  donorFlow: [
    "Sign up and create an account",
    "Complete KYC verification by uploading ID documents",
    "Fill out medical eligibility questionnaire",
    "Schedule a blood donation appointment",
    "Visit donation center and complete donation process",
    "Receive donation certificate and track donation history",
    "Get notifications for future donation eligibility dates"
  ],
  requestorFlow: [
    "Sign up and create an account",
    "Complete KYC verification by uploading ID documents",
    "Create a blood or organ request with patient details",
    "Provide medical documentation for verification",
    "Get matched with potential donors",
    "Coordinate with donation center for the transfusion/transplant",
    "Provide feedback and close the request when fulfilled"
  ],
  bloodDonationProcess: [
    "Registration and health screening (15 minutes)",
    "Mini-physical examination (blood pressure, pulse, temperature, hemoglobin)",
    "The actual donation process (8-10 minutes)",
    "Post-donation refreshments and rest (15 minutes)",
    "Total time: approximately 45-60 minutes"
  ],
  eligibilityRequirements: {
    general: [
      "Age 18-65 years",
      "Weight at least 50kg",
      "Good general health",
      "Hemoglobin levels: at least 12.5g/dL for females and 13.5g/dL for males"
    ],
    temporaryDeferrals: [
      "Cold, flu, or fever in the last week",
      "Antibiotics in the last 7 days",
      "Pregnancy in the last 6 months",
      "Major surgery in the last 3 months",
      "Tattoos or piercings in the last 3 months",
      "Travel to certain countries with high prevalence of specific diseases"
    ],
    permanentDeferrals: [
      "HIV/AIDS",
      "Hepatitis B or C",
      "Certain cancers",
      "History of heart attack or stroke",
      "Uncontrolled diabetes or hypertension",
      "Use of certain medications"
    ]
  },
  donationFrequency: {
    wholeBlood: "Every 3 months (12 weeks)",
    platelets: "Every 2 weeks (maximum 24 times per year)",
    plasma: "Every 28 days",
    doubleRedCells: "Every 6 months (24 weeks)"
  },
  bloodTypes: {
    compatibilities: [
      "O- is the universal donor (can donate to any blood type)",
      "AB+ is the universal recipient (can receive from any blood type)",
      "O+ can donate to O+, A+, B+, and AB+",
      "A+ can donate to A+ and AB+",
      "B+ can donate to B+ and AB+",
      "A- can donate to A+, A-, AB+, and AB-",
      "B- can donate to B+, B-, AB+, and AB-",
      "AB- can donate to AB+ and AB-"
    ],
    rarity: {
      "O+": "38.67% (most common)",
      "A+": "27.42%",
      "B+": "8.02%",
      "AB+": "2.58%",
      "O-": "7.25%",
      "A-": "6.09%",
      "B-": "1.59%",
      "AB-": "0.36% (rarest)"
    }
  },
  organDonation: {
    types: [
      "Kidneys", "Liver", "Heart", "Lungs", "Pancreas", 
      "Intestines", "Corneas", "Skin", "Bone marrow"
    ],
    livingDonation: [
      "Kidney (one of two)",
      "Liver segment",
      "Lobe of a lung",
      "Portion of pancreas",
      "Portion of intestine",
      "Bone marrow/stem cells"
    ],
    deceasedDonation: [
      "All organs and tissues can be considered",
      "One donor can save up to 8 lives through organ donation",
      "Can enhance the lives of over 75 people through tissue donation"
    ]
  },
  faqCategories: [
    "Donation Process",
    "Eligibility",
    "Medical",
    "Post Donation",
    "Account",
    "Technical",
    "Preparation"
  ]
};


export const sampleUserData = {
  profile: {
    id: "4110110002007",
    name: "Mozahidur Rahaman",
    bloodType: "B+",
    eligibilityStatus: "Eligible",
    lastDonationDate: "2025-08-15",
    nextEligibleDate: "2025-11-15",
    donationCount: 5,
    badges: ["Regular Donor", "First Time", "Hero Status"],
    preferences: {
      donationTypes: ["Whole Blood", "Platelets"],
      notificationPreference: "Email and SMS",
      preferredDonationCenters: ["City General Hospital", "Blood Bank Central"]
    }
  },
  donationHistory: [
    {
      id: "don-001",
      type: "Whole Blood",
      date: "2025-08-15",
      location: "City General Hospital",
      units: 1,
      status: "Completed",
      impact: "Helped save 3 lives"
    },
    {
      id: "don-002",
      type: "Platelets",
      date: "2025-02-10",
      location: "Blood Bank Central",
      units: 1,
      status: "Completed",
      impact: "Helped 1 cancer patient"
    },
    {
      id: "don-003",
      type: "Whole Blood",
      date: "2024-11-05",
      location: "City General Hospital",
      units: 1,
      status: "Completed",
      impact: "Emergency transfusion"
    }
  ],
  requestHistory: [
    {
      id: "req-001",
      type: "Blood Request",
      bloodType: "A+",
      units: 2,
      patientName: "Mohan Singh",
      hospital: "City Medical Center",
      urgency: "High",
      createdDate: "2025-01-15",
      status: "Fulfilled",
      matchedDonors: 2
    }
  ],
  notifications: [
    {
      id: "notif-001",
      type: "Eligibility",
      message: "You are now eligible to donate blood again!",
      date: "2025-08-15",
      isRead: false
    },
    {
      id: "notif-002",
      type: "Request Update",
      message: "Your blood request REQ-001 has been fulfilled",
      date: "2025-01-18",
      isRead: true
    },
    {
      id: "notif-003",
      type: "Donation Reminder",
      message: "Your scheduled donation is tomorrow at 10:00 AM",
      date: "2025-05-14",
      isRead: true
    }
  ],
  upcomingAppointments: [
    {
      id: "appt-001",
      type: "Blood Donation",
      date: "2025-08-20",
      time: "14:30",
      location: "City General Hospital",
      status: "Confirmed"
    }
  ]
};
