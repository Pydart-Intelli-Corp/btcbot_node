'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Twitter, Facebook, Linkedin, Youtube, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const [showCookieNotice, setShowCookieNotice] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('btcbot24-cookies-accepted');
    if (!cookiesAccepted) {
      setShowCookieNotice(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('btcbot24-cookies-accepted', 'true');
    setShowCookieNotice(false);
  };
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Statistics Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Smart AI Arbitrage Trading System
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              $25
            </div>
            <div className="text-gray-600 text-lg">Annual License</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 mb-2">
              24/7
            </div>
            <div className="text-gray-600 text-lg">AI Trading</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              2.25%
            </div>
            <div className="text-gray-600 text-lg">Max Daily ROI</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-2">
              400%
            </div>
            <div className="text-gray-600 text-lg">Max Total Return</div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-white">BTCBOT24</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Next-generation AI Arbitrage Trading Platform enabling investors to earn consistent 
                passive income through automated trading bots with 24/7 market analysis and execution.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Navigate</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Product
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Support Us</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/faqs" className="text-gray-400 hover:text-blue-400 transition-colors">
                    FAQ&apos;s
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
              <h3 className="text-white font-semibold text-lg mb-6 mt-8">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Contact US</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">support@btcbot24.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">++17405088596‬</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                  <span className="text-gray-400">
                    Beaufort Court, Admirals Way, London,<br />London, United Kingdom
                  </span>
                </div>
              </div>
              <Link 
                href="/contact" 
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors mt-6"
              >
                <span>Help Center</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © All Services Operational
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">All Systems Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Notice */}
      {showCookieNotice && (
        <div className="bg-gray-800 border-t border-gray-700 animate-fade-in-up">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm mb-4 md:mb-0">
                We use cookies to tailor your experience on BTCBOT24. Learn more in our{' '}
                <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                  privacy policy
                </Link>
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleAcceptCookies}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Accept Cookies
                </button>
                <button 
                  onClick={() => setShowCookieNotice(false)}
                  className="px-4 py-2 text-white bg-gray-600 hover:text-white hover:bg-gray-700 text-sm transition-colors rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;