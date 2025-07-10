import React from 'react';
import { Link } from 'react-router-dom';
import { School, Linkedin, Instagram, Facebook, Youtube, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#020817] text-gray-600 dark:text-gray-400 border-t dark:border-gray-800 pt-10 pb-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                <School className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduNest</h1>
            </div>
            <p className="text-sm">
               EduNest is Bangladesh's leading Upskilling & Job Placement Platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-600"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-blue-600"><Instagram size={20} /></a>
              <a href="#" className="hover:text-blue-600"><Facebook size={20} /></a>
              <a href="#" className="hover:text-blue-600"><Youtube size={20} /></a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/course/search?query=" className="hover:text-blue-600">Courses</Link></li>
              <li><Link to="/my-learning" className="hover:text-blue-600">My Learning</Link></li>
              <li><Link to="/become-an-instructor" className="hover:text-blue-600">Become an Instructor</Link></li>
              <li><Link to="/about-us" className="hover:text-blue-600">About Us</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Rasos-52/A, Raynagar, Sylhet-3100</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>operations@edunest.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>+8801396641126</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-3 rounded-lg text-center font-semibold">
                GUARANTEED SECURE PAYMENT
            </div>
             <p className="text-sm">We Accept</p>
             <div className="flex items-center space-x-4">
                <span className="font-bold text-lg">Stripe</span>
                <span className="font-bold text-lg">Master Card</span>
                <span className="font-bold text-lg">VISA</span>
             </div>
          </div>

        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex space-x-4 mb-2 md:mb-0">
            <Link to="/terms-and-conditions" className="hover:text-blue-600">Terms & Conditions</Link>
            <Link to="/privacy-policy" className="hover:text-blue-600">Privacy policy</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} All Rights Reserved to EduNest</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
