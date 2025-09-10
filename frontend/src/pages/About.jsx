import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedNumber from '../components/AnimatedNumber';

const AboutPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">About Our Blood & Organ Donation Platform</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Our mission is to bridge the gap between donors and recipients, making the donation process 
            more accessible, efficient, and transparent. We believe that everyone should have the 
            opportunity to give the gift of life, and those in need should have timely access to life-saving 
            donations. Through technology and community engagement, we aim to increase donation rates 
            and save more lives.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                <AnimatedNumber 
                  value="10,000+" 
                  duration={2500}
                  storageKey="about-blood-donations" 
                />
              </div>
              <p className="text-gray-700">Blood Donations</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                <AnimatedNumber 
                  value="5,000+" 
                  duration={2500}
                  storageKey="about-organ-pledges" 
                />
              </div>
              <p className="text-gray-700">Organ Pledges</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                <AnimatedNumber 
                  value="15,000+" 
                  duration={2500}
                  storageKey="about-lives-impacted" 
                />
              </div>
              <p className="text-gray-700">Lives Impacted</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Blood Donation</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Blood donation is a simple process that takes about 10-15 minutes. A healthy person can donate 
              blood every three months. Each donation can save up to three lives, as the blood is separated into 
              red cells, platelets, and plasma.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700">Who Can Donate?</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
              <li>Anyone between 18 and 65 years of age</li>
              <li>People weighing more than 50 kg</li>
              <li>Those with hemoglobin levels above 12.5 g/dL</li>
              <li>People in general good health with no active infections</li>
            </ul>
            <Link 
              to="/donate" 
              className="inline-block mt-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
            >
              Donate Blood
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Organ Donation</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Organ donation is the process of surgically removing an organ or tissue from one person (the donor) 
              and placing it into another person (the recipient). It can be done while the donor is alive (living donation) 
              or after death (deceased donation).
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700">Types of Organ Donation:</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
              <li>Living donation (kidneys, liver lobes, lung lobes, etc.)</li>
              <li>Deceased donation (all major organs and tissues)</li>
              <li>Directed donation (to a specific person)</li>
              <li>Non-directed donation (to anyone in need)</li>
            </ul>
            <Link 
              to="/donate" 
              className="inline-block mt-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              Pledge Organs
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start">
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-xl mb-4 md:mb-0 md:mr-4 flex-shrink-0">1</div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Register as a Donor</h3>
                <p className="text-gray-600">
                  Create your account, complete your profile with health information and upload necessary documents 
                  for KYC verification. This helps us ensure the safety and integrity of the donation process.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start">
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-xl mb-4 md:mb-0 md:mr-4 flex-shrink-0">2</div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Complete Health Screening</h3>
                <p className="text-gray-600">
                  Our medical team reviews your health information to ensure you're eligible to donate. 
                  For blood donations, additional tests may be performed at the donation center.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start">
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-xl mb-4 md:mb-0 md:mr-4 flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Donate or Respond to Requests</h3>
                <p className="text-gray-600">
                  Schedule your donation at a convenient time, or respond to specific requests from people in need. 
                  Our platform notifies you when there's a match for your blood type or organ preference.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start">
              <div className="bg-primary text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-xl mb-4 md:mb-0 md:mr-4 flex-shrink-0">4</div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Track Your Impact</h3>
                <p className="text-gray-600">
                  After donation, track the impact of your contribution through your dashboard. 
                  See how many lives you've potentially saved and get reminders for your next eligible donation date.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-3 overflow-hidden">
                <img src="https://i.pinimg.com/736x/c1/e2/bd/c1e2bda65737aee4c0a9c0058aa3f112.jpg"/>
              </div>
              <h3 className="text-lg font-medium text-gray-800">Dr. Michael Davis</h3>
              <p className="text-gray-600">Medical Director</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-3 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
                  <img src="https://i.pinimg.com/736x/59/90/03/59900345eb28c6cb99e0e583ea7e7519.jpg"  />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-800">Sarah Patel</h3>
              <p className="text-gray-600">Operations Manager</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-3 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">
                  <img src="https://i.pinimg.com/736x/50/01/6a/50016a8c9ef67cd3dbf61f9097cbf942.jpg"w />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-800">James Wilson</h3>
              <p className="text-gray-600">Technology Lead</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Our team consists of medical professionals, technology experts, and passionate volunteers 
              dedicated to making organ and blood donation more accessible to everyone.
            </p>
            
            <Link 
              to="/contact" 
              className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
        
        <div className="bg-primary-light rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#fefefe]">Ready to Save Lives?</h2>
          <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
            Join our community of donors and make a difference in someone's life today. 
            Every donation counts, whether it's blood or an organ pledge.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup" 
              className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300 font-medium"
            >
              Register as a Donor
            </Link>
            <Link 
              to="/request" 
              className="px-8 py-3 bg-white text-primary border border-primary rounded-md hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              Request a Donation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
