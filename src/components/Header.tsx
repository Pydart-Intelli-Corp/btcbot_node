'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { makeCoinGeckoRequest } from '@/lib/rateLimiter';

interface CryptoPrice {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isNegative: boolean;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    { name: 'Bitcoin', symbol: 'BTC', price: '$121,564', change: '-0.4%', isNegative: true },
    { name: 'Ethereum', symbol: 'ETH', price: '$4,363.83', change: '-1.9%', isNegative: true },
    { name: 'BNB', symbol: 'BNB', price: '$1,269.99', change: '-1.9%', isNegative: true },
    { name: 'XRP', symbol: 'XRP', price: '$2.82', change: '-0.2%', isNegative: true },
    { name: 'Solana', symbol: 'SOL', price: '$221.59', change: '-2.5%', isNegative: true },
    { name: 'Cardano', symbol: 'ADA', price: '$1.23', change: '+2.1%', isNegative: false },
    { name: 'Dogecoin', symbol: 'DOGE', price: '$0.42', change: '+5.7%', isNegative: false },
    { name: 'Avalanche', symbol: 'AVAX', price: '$67.89', change: '-1.2%', isNegative: true },
    { name: 'Polygon', symbol: 'MATIC', price: '$0.98', change: '+3.4%', isNegative: false },
    { name: 'Chainlink', symbol: 'LINK', price: '$25.67', change: '-0.8%', isNegative: true },
    { name: 'Polkadot', symbol: 'DOT', price: '$18.45', change: '+1.6%', isNegative: false },
    { name: 'Litecoin', symbol: 'LTC', price: '$234.56', change: '-2.1%', isNegative: true },
    { name: 'Shiba Inu', symbol: 'SHIB', price: '$0.000089', change: '+8.2%', isNegative: false },
    { name: 'Cosmos', symbol: 'ATOM', price: '$12.34', change: '+0.5%', isNegative: false },
    { name: 'Uniswap', symbol: 'UNI', price: '$15.78', change: '-1.5%', isNegative: true },
  ]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        console.log('🔄 Fetching header crypto prices...');
        
        const coinIds = [
          'bitcoin', 'ethereum', 'binancecoin', 'ripple', 'solana', 
          'cardano', 'dogecoin', 'avalanche-2', 'matic-network', 'chainlink',
          'polkadot', 'litecoin', 'shiba-inu', 'cosmos', 'uniswap'
        ];
        
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;
        const data = await makeCoinGeckoRequest(url, 'Header');
        
        console.log('🎯 Header Crypto API Response:', data);
        
        const coinMapping: {[key: string]: {name: string, symbol: string}} = {
          'bitcoin': { name: 'Bitcoin', symbol: 'BTC' },
          'ethereum': { name: 'Ethereum', symbol: 'ETH' },
          'binancecoin': { name: 'BNB', symbol: 'BNB' },
          'ripple': { name: 'XRP', symbol: 'XRP' },
          'solana': { name: 'Solana', symbol: 'SOL' },
          'cardano': { name: 'Cardano', symbol: 'ADA' },
          'dogecoin': { name: 'Dogecoin', symbol: 'DOGE' },
          'avalanche-2': { name: 'Avalanche', symbol: 'AVAX' },
          'matic-network': { name: 'Polygon', symbol: 'MATIC' },
          'chainlink': { name: 'Chainlink', symbol: 'LINK' },
          'polkadot': { name: 'Polkadot', symbol: 'DOT' },
          'litecoin': { name: 'Litecoin', symbol: 'LTC' },
          'shiba-inu': { name: 'Shiba Inu', symbol: 'SHIB' },
          'cosmos': { name: 'Cosmos', symbol: 'ATOM' },
          'uniswap': { name: 'Uniswap', symbol: 'UNI' }
        };
        
        const formatPrice = (price: number): string => {
          if (price < 1) return `$${price.toFixed(4)}`;
          if (price < 100) return `$${price.toFixed(2)}`;
          return `$${Math.round(price).toLocaleString()}`;
        };
        
        const formatChange = (change: number | null | undefined): string => {
          if (change === null || change === undefined || isNaN(change)) {
            return '0.0%';
          }
          const sign = change >= 0 ? '+' : '';
          return `${sign}${change.toFixed(1)}%`;
        };
        
        const updatedPrices: CryptoPrice[] = coinIds.map(coinId => {
          const coinData = data[coinId];
          const coinInfo = coinMapping[coinId];
          
          if (coinData && coinInfo && coinData.usd !== undefined) {
            return {
              name: coinInfo.name,
              symbol: coinInfo.symbol,
              price: formatPrice(coinData.usd),
              change: formatChange(coinData.usd_24h_change),
              isNegative: (coinData.usd_24h_change || 0) < 0
            };
          }
          
          // Return fallback data if API data is incomplete
          const fallbackCoin = cryptoPrices.find(c => c.symbol === coinInfo?.symbol);
          return fallbackCoin || {
            name: coinInfo?.name || 'Unknown',
            symbol: coinInfo?.symbol || 'UNK',
            price: '$0.00',
            change: '0.0%',
            isNegative: false
          };
        });
        
        console.log('📈 Header Updated Prices:', updatedPrices);
        setCryptoPrices(updatedPrices);
      } catch (error) {
        console.error('❌ Error fetching crypto prices:', error);
        console.log('🔄 Using fallback hardcoded prices');
        // Keep using hardcoded data if API fails
      }
    };

    // Initial fetch with delay
    setTimeout(fetchCryptoPrices, 1000);
    
    // Update every 90 seconds to better coordinate with other components
    const interval = setInterval(fetchCryptoPrices, 90000);
    
    return () => clearInterval(interval);
  }, []);

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
              className="px-4 py-2 text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-black transition-all duration-200 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  className="px-4 py-2 text-center text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-black transition-all duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
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