'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';

const MarketHeatmapSection = () => {
  const [cryptoData, setCryptoData] = useState([
    { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      price: '$121,598', 
      change: '-0.36%', 
      isPositive: false, 
      icon: '₿',
      gradient: 'from-orange-500 to-yellow-500',
      marketCap: '$2.41T',
      volume: '$45.2B'
    },
    { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      price: '$4,367.72', 
      change: '-1.87%', 
      isPositive: false, 
      icon: 'Ξ',
      gradient: 'from-blue-500 to-indigo-500',
      marketCap: '$525.8B',
      volume: '$28.7B'
    },
    { 
      name: 'Ripple', 
      symbol: 'XRP', 
      price: '$2.83', 
      change: '-0.19%', 
      isPositive: false, 
      icon: '◆',
      gradient: 'from-gray-500 to-slate-500',
      marketCap: '$161.2B',
      volume: '$8.4B'
    },
    { 
      name: 'Binance Coin', 
      symbol: 'BNB', 
      price: '$1,271.17', 
      change: '-1.95%', 
      isPositive: false, 
      icon: '🔶',
      gradient: 'from-yellow-500 to-amber-500',
      marketCap: '$183.5B',
      volume: '$2.1B'
    },
    { 
      name: 'Solana', 
      symbol: 'SOL', 
      price: '$221.52', 
      change: '-2.54%', 
      isPositive: false, 
      icon: '◉',
      gradient: 'from-purple-500 to-violet-500',
      marketCap: '$103.8B',
      volume: '$5.2B'
    },
    { 
      name: 'Dogecoin', 
      symbol: 'DOGE', 
      price: '$0.252', 
      change: '+1.00%', 
      isPositive: true, 
      icon: '🐕',
      gradient: 'from-yellow-400 to-orange-400',
      marketCap: '$37.1B',
      volume: '$3.8B'
    },
    { 
      name: 'Cardano', 
      symbol: 'ADA', 
      price: '$0.821', 
      change: '+0.03%', 
      isPositive: true, 
      icon: '₳',
      gradient: 'from-blue-400 to-cyan-400',
      marketCap: '$28.7B',
      volume: '$1.9B'
    },
    { 
      name: 'Tron', 
      symbol: 'TRX', 
      price: '$0.336', 
      change: '-0.96%', 
      isPositive: false, 
      icon: 'Ŧ',
      gradient: 'from-red-500 to-pink-500',
      marketCap: '$28.9B',
      volume: '$1.2B'
    },
    { 
      name: 'Avalanche', 
      symbol: 'AVAX', 
      price: '$28.53', 
      change: '+0.26%', 
      isPositive: true, 
      icon: '🔺',
      gradient: 'from-red-400 to-rose-400',
      marketCap: '$11.5B',
      volume: '$892M'
    },
    { 
      name: 'Sui', 
      symbol: 'SUI', 
      price: '$3.47', 
      change: '-0.41%', 
      isPositive: false, 
      icon: '〜',
      gradient: 'from-cyan-500 to-blue-500',
      marketCap: '$10.2B',
      volume: '$564M'
    },
    { 
      name: 'Pepe', 
      symbol: 'PEPE', 
      price: '$0.000021', 
      change: '-0.19%', 
      isPositive: false, 
      icon: '🐸',
      gradient: 'from-green-400 to-emerald-400',
      marketCap: '$8.9B',
      volume: '$2.1B'
    },
    { 
      name: 'Toncoin', 
      symbol: 'TON', 
      price: '$5.42', 
      change: '+0.00%', 
      isPositive: true, 
      icon: '💎',
      gradient: 'from-blue-600 to-purple-600',
      marketCap: '$13.8B',
      volume: '$234M'
    },
    { 
      name: 'Stellar', 
      symbol: 'XLM', 
      price: '$0.384', 
      change: '+0.25%', 
      isPositive: true, 
      icon: '★',
      gradient: 'from-gray-600 to-slate-600',
      marketCap: '$11.5B',
      volume: '$445M'
    },
    { 
      name: 'Chainlink', 
      symbol: 'LINK', 
      price: '$22.57', 
      change: '+0.97%', 
      isPositive: true, 
      icon: '🔗',
      gradient: 'from-blue-500 to-sky-500',
      marketCap: '$14.1B',
      volume: '$678M'
    },
    { 
      name: 'Shiba Inu', 
      symbol: 'SHIB', 
      price: '$0.000024', 
      change: '-0.70%', 
      isPositive: false, 
      icon: '🐕',
      gradient: 'from-orange-400 to-red-400',
      marketCap: '$14.2B',
      volume: '$1.8B'
    },
    { 
      name: 'Polygon', 
      symbol: 'MATIC', 
      price: '$0.485', 
      change: '+2.15%', 
      isPositive: true, 
      icon: '🔷',
      gradient: 'from-purple-600 to-indigo-600',
      marketCap: '$4.8B',
      volume: '$423M'
    }
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData(prevData => 
        prevData.map(crypto => {
          const randomChange = (Math.random() - 0.5) * 0.1; // Random change between -0.05% and +0.05%
          const currentChange = parseFloat(crypto.change.replace('%', '').replace('+', ''));
          const newChange = (currentChange + randomChange).toFixed(2);
          const isPositive = parseFloat(newChange) >= 0;
          
          return {
            ...crypto,
            change: `${isPositive ? '+' : ''}${newChange}%`,
            isPositive
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
              Market Heatmap
            </span>
          </h2>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto">
            Real-time cryptocurrency market data powered by AI analytics. 
            Monitor price movements and trends across major digital assets with live updates.
          </p>
        </motion.div>

        {/* Market Stats Overview */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">67%</div>
            <div className="text-green-100 text-xs font-medium">Gainers</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-4 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <TrendingDown className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">33%</div>
            <div className="text-red-100 text-xs font-medium">Losers</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <BarChart3 className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">$2.4T</div>
            <div className="text-blue-100 text-xs font-medium">Market Cap</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl p-4 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Activity className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">$125B</div>
            <div className="text-purple-100 text-xs font-medium">24h Volume</div>
          </div>
        </motion.div>

        {/* Crypto Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {cryptoData.map((crypto, index) => (
            <motion.div 
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
              <div className={`relative bg-gradient-to-br ${crypto.gradient} p-1 rounded-xl shadow-md hover:shadow-xl transition-all duration-500`}>
                <div className="bg-white rounded-lg p-4 h-full">
                  {/* Header with Icon and Change */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xl">{crypto.icon}</div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      crypto.isPositive 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {crypto.isPositive ? (
                        <TrendingUp className="w-2 h-2 mr-1" />
                      ) : (
                        <TrendingDown className="w-2 h-2 mr-1" />
                      )}
                      {crypto.change}
                    </div>
                  </div>

                  {/* Crypto Info */}
                  <div className="mb-3">
                    <h3 className="text-gray-900 font-bold text-sm mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                      {crypto.name}
                    </h3>
                    <p className="text-gray-500 text-xs font-medium">
                      {crypto.symbol}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="text-gray-500 text-xs mb-1">Price</div>
                    <div className="text-gray-900 font-bold text-sm">
                      {crypto.price}
                    </div>
                  </div>

                  {/* Market Stats - Simplified */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">MCap</span>
                      <span className="font-medium text-gray-700">{crypto.marketCap}</span>
                    </div>
                  </div>

                  {/* Animated Border */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-lg bg-gradient-to-r ${crypto.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${crypto.gradient} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-500 pointer-events-none`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Live Indicator */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg">
            <motion.div 
              className="w-3 h-3 bg-white rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Live market data • AI-powered updates every 5 seconds</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketHeatmapSection;