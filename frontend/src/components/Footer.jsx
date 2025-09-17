import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              {/* <Heart className="h-8 w-8 text-primary" /> */}
              <div className='w-7 h-7'>
                <img src="/icon.png" alt="DonorSphereX Logo" />
              </div>
              <span className="ml-2 text-xl font-bold">Donor</span>
              <span className="text-secondary text-lg ml-1">SphereX</span>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Connecting donors with those in need through a seamless platform for organ and blood donation.
            </p>
            <div className="flex mt-6 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/donation/blood" className="text-gray-400 hover:text-white text-sm">
                  Donate Blood
                </Link>
              </li>
              <li>
                <Link to="/requests/blood" className="text-gray-400 hover:text-white text-sm">
                  Request Blood 
                </Link>
              </li>
              <li>
                <a href="/sitemap.html" className="text-gray-400 hover:text-white text-sm">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-gray-400 text-sm">
                <Mail size={16} className="mr-2" />
                <span>info@donorspherex.com</span>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Phone size={16} className="mr-2" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright section */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} DonorSphereX. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Made with <Heart size={14} className="inline text-primary mx-1" /> for saving lives
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
