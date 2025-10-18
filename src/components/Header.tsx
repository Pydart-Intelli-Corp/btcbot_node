'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const cryptoPrices = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$121,564', change: '-0.4%', isNegative: true },
    { name: 'Ethereum', symbol: 'ETH', price: '$4,363.83', change: '-1.9%', isNegative: true },
    { name: 'BNB', symbol: 'BNB', price: '$1,269.99', change: '-1.9%', isNegative: true },
    { name: 'XRP', symbol: 'XRP', price: '$2.82', change: '-0.2%', isNegative: true },
    { name: 'Tether', symbol: 'USDT', price: '$0.9999', change: '-0.0%', isNegative: true },
    { name: 'Solana', symbol: 'SOL', price: '$221.59', change: '-2.5%', isNegative: true },
  ];

  return (
    <header className="bg-black text-white">
      {/* Crypto Price Ticker */}
      <div className="bg-gray-900 py-2 overflow-hidden">
        <div className="animate-scroll flex space-x-8 whitespace-nowrap">
          {cryptoPrices.map((crypto, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <span className="text-gray-300">{crypto.name} price</span>
              <span className="text-white font-semibold">{crypto.price}</span>
              <span className={crypto.isNegative ? 'text-red-500' : 'text-green-500'}>
                {crypto.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-white">BTCBOT24</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-white hover:text-blue-400 transition-colors">
              Product
            </Link>
            <Link href="/faqs" className="text-white hover:text-blue-400 transition-colors">
              FAQ&apos;s
            </Link>
            <Link href="/contact" className="text-white hover:text-blue-400 transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-gray-900 rounded-lg p-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-white hover:text-blue-400 transition-colors py-2">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-blue-400 transition-colors py-2">
                About
              </Link>
              <Link href="/pricing" className="text-white hover:text-blue-400 transition-colors py-2">
                Product
              </Link>
              <Link href="/faqs" className="text-white hover:text-blue-400 transition-colors py-2">
                FAQ&apos;s
              </Link>
              <Link href="/contact" className="text-white hover:text-blue-400 transition-colors py-2">
                Contact Us
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
                <Link
                  href="/login"
                  className="px-4 py-2 text-center text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;