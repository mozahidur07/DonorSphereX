import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Droplet, CheckCircle, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Header from '../components/Navbar';
import Process from '../components/Process';
import Compatibility from '../components/Compatibility';
import AnimatedNumber from '../components/AnimatedNumber';
import '../font.css'

const HomePage = () => {
  // Get authentication context
  const { isAuthenticated } = useAuth();
  
  // Hero section stats
  const stats = [
    { name: 'Registered Donors', value: '10,000+' },
    { name: 'Successful Donations', value: '5,000+' },
    { name: 'Lives Saved', value: '15,000+' },
    { name: 'Medical Centers', value: '500+' }
  ];

  // Donation types
  const donationTypes = [
    {
      title: 'Blood Donation',
      description: 'Regular blood donations are crucial for maintaining adequate supplies for surgeries, medical treatments, and emergencies.',
      icon: <Droplet className="h-10 w-10 text-primary" />,
      link: '/donation/blood'
    },
    {
      title: 'Organ Donation',
      description: 'By registering as an organ donor, you can provide lifesaving transplants to those suffering from organ failure.',
      icon: <Heart className="h-10 w-10 text-primary" />,
      link: '/donation/organ'
    }
  ];

  // How it works steps
  const steps = [
    {
      title: 'Register',
      description: 'Create an account and complete your profile with basic medical information.',
      icon: <Users className="h-8 w-8 text-white" />
    },
    {
      title: 'Medical Screening',
      description: 'Complete a short medical questionnaire to determine your eligibility.',
      icon: <CheckCircle className="h-8 w-8 text-white" />
    },
    {
      title: 'Donate',
      description: 'Schedule your donation at a convenient time and location.',
      icon: <Heart className="h-8 w-8 text-white" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              <div>
                <h1 className="text-4xl fade-text-box font-extrabold asimovian-regular tracking-tight sm:text-5xl lg:text-6xl">
                  Save Lives Through Donation
                 {/* <div className="fade-gradient" /> */}
                </h1>
                <p className="mt-6 text-xl text-white text-opacity-90 max-w-3xl">
                  Your donation can make a profound difference in someone's life. Join our community of donors to help save lives through blood and organ donation.
                </p>
                <div className="mt-10 flex space-x-4">
                  {isAuthenticated() ? (
                    <Link
                      to="/donation/blood"
                      className="bg-white text-primary font-semibold px-6 py-3 rounded-md shadow-md hover:bg-gray-100 transition duration-200"
                    >
                      Donate Now
                    </Link>
                  ) : (
                    <Link
                      to="/signup"
                      className="bg-white text-primary font-semibold px-6 py-3 rounded-md shadow-md hover:bg-gray-100 transition duration-200"
                    >
                      Register as Donor
                    </Link>
                  )}
                  <Link
                    to="/about"
                    className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:bg-opacity-10 transition duration-200"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 flex items-center scale-[0.85] md:scale-100 justify-center relative">
                {/* Animated Rectangle & Circle Overlays */}
                <img 
                  src="https://i.pinimg.com/736x/92/17/35/9217354537070a54cd9db3045d8c9c35.jpg"   
                  alt="Blood and Organ Donation" 
                  className="rounded-lg shadow-lg relative z-10"
                  // on error fallback
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://i.pinimg.com/1200x/25/95/09/2595095b2370dcca85069aba70640d1a.jpg";
                  }}
                />
                {/* Top-right overlay */}
                <div className="absolute top-0 right-0 z-20">
                  <div className="relative">
                    {/* Animated rectangle with centered info */}
                    <div className=" absolute -top-1 -right-3 w-32 h-16 bg-white/10 backdrop-blur-md rounded-xl shadow-lg -rotate-12 flex items-center justify-center pointer-events-none" style={{animationDelay: '0s'}}>
                      <div className="text-center pointer-events-none">
                        <div className="font-bold text-sm text-white">Last Donation</div>
                        <div className="text-xs text-white">4 hours ago</div>
                      </div>
                    </div>
                    <div className="fade-blob-anim pointer-events-none absolute top-0 right-0 w-20 h-20 bg-primary/30 rounded-full blur-2xl" style={{animationDelay: '1.5s'}} />
                  </div>
                </div>
                <div className="absolute top-0 right-0 z-10">
                  <div className="relative">
                    <div className="fade-blob-anim pointer-events-none absolute -top-10 -right-8 w-20 h-20 bg-white/40 backdrop-blur-md rounded-full shadow-lg" style={{animationDelay: '0s'}} />
                    <div className="fade-blob-anim pointer-events-none absolute top-0 right-0 w-20 h-20 bg-primary/30 rounded-full blur-2xl" style={{animationDelay: '1.5s'}} />
                  </div>
                </div>
                {/* Bottom-left overlay */}
                <div className="absolute bottom-0 left-0 z-20">
                  <div className="relative">
                    {/* Animated rectangle with centered Lives Saved info */}
                    <div className=" absolute -bottom-4 -left-2 w-32 h-16 bg-white/10 backdrop-blur-md rounded-xl shadow-lg rotate-12 flex items-center justify-center pointer-events-none" style={{animationDelay: '0.8s'}}>
                      <div className="text-center pointer-events-none">
                        <div className="font-semibold text-sm text-white">Lives Saved</div>
                        <div className="text-xs text-white">500+ this month</div>
                      </div>
                    </div>
                    <div className="fade-blob-anim pointer-events-none absolute bottom-0 left-0 w-24 h-24 bg-primary/30 rounded-full blur-2xl" style={{animationDelay: '2.2s'}} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 z-10">
                  <div className="relative">
                    <div className="fade-blob-anim pointer-events-none absolute -bottom-10 -left-8 w-20 h-20 bg-white/40 backdrop-blur-md rounded-full shadow-lg" style={{animationDelay: '0.8s'}} />
                    <div className="fade-blob-anim pointer-events-none absolute bottom-0 left-0 w-24 h-24 bg-primary/30 rounded-full blur-2xl" style={{animationDelay: '2.2s'}} />
                  </div>
                </div>
              </div>
              
      {/* Fade in/out animation for overlays */}
      <style>
        {`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.2; }
          }
          .fade-blob-anim {
            animation: fadeInOut 5s ease-in-out infinite;
          }
        `}
      </style>
            </div>
            
            {/* Stats */}
            <div className="mt-16 border-t border-white border-opacity-20 pt-10">
              <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="flex flex-col">
                    <dt className="order-2 text-base font-medium text-white text-opacity-70">
                      {stat.name}
                    </dt>
                    <dd className="order-1 text-3xl font-extrabold text-white">
                      <AnimatedNumber 
                        value={stat.value} 
                        duration={2500}
                        storageKey={`home-stat-${stat.name}`} 
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Donation Types Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How You Can Help
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                Whether it's blood or organ donation, every contribution matters and can save multiple lives.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {donationTypes.map((donationType, index) => (
                  <div key={index} className="bg-gray-50 border-[1px] border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      {donationType.icon}
                      <h3 className="ml-4 text-xl font-semibold text-gray-900">
                        {donationType.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      {donationType.description}
                    </p>
                    <Link
                      to={donationType.link}
                      className="inline-flex items-center text-primary font-medium hover:text-primary-dark"
                    >
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Process visual component */}
        <div className="py-12">
          <Process />
        </div>

        {/* Blood Type Compatibility */}
        <div className="py-12">
          <Compatibility />
        </div>

        {/* How It Works Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                Becoming a donor is simple and straightforward. Follow these steps to get started.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary mb-4 mx-auto">
                      {step.icon}
                      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-center text-gray-600">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Success Stories
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                Read about the impact of donations on real people's lives.
              </p>
            </div>
            
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {/* Card 1 - Regular Donor */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:z-10 cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-3 border-2 border-primary">
                      <img src="https://i.pinimg.com/736x/2b/cc/55/2bcc55b3291035c4e53afbaa5dd1ae83.jpg" className="w-full h-full object-cover" alt="Arjun Mehta" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-800">Arjun Mehta</h3>
                        <svg className="h-5 w-5 text-primary ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-500">Regular Donor</div>
                      <div className="text-xs text-primary font-medium">10+ Donations</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Just completed my 10th donation! The process was smooth as always. Feels great to know I'm helping save lives.  <span className='text-blue-600'>  #BloodDonation #SaveLives</span> 💉
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    2 hours ago
                  </div>
                </div>
                
                <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-sm">234</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">12</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span className="text-sm">56</span>
                  </div>
                </div>
              </div>
              
              {/* Card 2 - Blood Recipient */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:z-10 cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-3 border-2 border-primary">
                      <img src="https://i.pinimg.com/736x/eb/b7/64/ebb764739f6c12bf434b4583b0656c60.jpg" className="w-full h-full object-cover" alt="Priya Nair" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-800">Priya Nair</h3>
                        <svg className="h-5 w-5 text-primary ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-500">Blood Recipient</div>
                      <div className="text-xs text-primary font-medium">Life Saved</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Forever grateful to the donors who saved my life during emergency surgery. The quick response made all the difference. ❤️ <span className='text-blue-600'>#ThankYouDonors </span> 
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    1 day ago
                  </div>
                </div>
                
                <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-sm">542</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">45</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span className="text-sm">128</span>
                  </div>
                </div>
              </div>
              
              {/* Card 3 - Hospital Partner */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:z-10 cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-3 border-2 border-primary">
                      <img src="https://i.pinimg.com/736x/c9/dc/a8/c9dca894be7a95741e9f612912d29a1e.jpg" className="w-full h-full object-cover" alt="Dr. Vikram Gupta" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-800">Dr. Vikram Gupta</h3>
                        <svg className="h-5 w-5 text-primary ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-500">Hospital Partner</div>
                      <div className="text-xs text-primary font-medium">City General Hospital</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Our partnership has revolutionized how we handle emergencies. Real-time inventory tracking is a game-changer! 🏥 
                    <span className='text-blue-600'>#Healthcare #Innovation</span>
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    3 days ago
                  </div>
                </div>
                
                <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-sm">876</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">67</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span className="text-sm">234</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to Make a Difference?
              </h2>
              <p className="mt-4 text-xl text-white text-opacity-90 max-w-3xl mx-auto">
                Join thousands of donors who are saving lives every day through organ and blood donation.
              </p>
              <div className="mt-8 flex justify-center">
                {isAuthenticated() ? (
                  <Link
                    to="/donation/blood"
                    className="bg-white text-primary font-medium px-6 py-3 rounded-md shadow-sm hover:bg-gray-100 transition"
                  >
                    Donate Now
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="bg-white text-primary font-medium px-6 py-3 rounded-md shadow-sm hover:bg-gray-100 transition"
                  >
                    Register Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
