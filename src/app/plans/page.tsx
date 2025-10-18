'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Portfolio {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  minInvestment: string;
  maxInvestment: string;
  durationValue: number;
  durationUnit: string;
  dailyROI: string;
  totalReturnLimit: string;
  features: string[];
  type: 'Basic' | 'Premium' | 'Elite';
  category: string;
  subscriptionFee: string;
  requiresSubscription: boolean;
  isElite: boolean;
  availableSlots: number;
  usedSlots: number;
  totalSubscribers: number;
  backgroundColor: string;
  textColor: string;
  gradientColorFrom: string;
  gradientColorTo: string;
  availabilityStatus: string;
  remainingSlots: number;
  formattedPrice: string;
  investmentRange: string;
  durationInDays: number;
  totalPossibleReturn: number;
}

const typeColors = {
  Basic: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900'
  },
  Premium: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900'
  },
  Elite: {
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    border: 'border-yellow-300',
    text: 'text-orange-900'
  }
};

export default function PlansPage() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view subscription plans');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/portfolios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }

      const data = await response.json();
      
      if (data.success) {
        setPortfolios(data.data);
      } else {
        setError(data.message || 'Failed to load portfolios');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading portfolios');
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolios = selectedType === 'all' 
    ? portfolios 
    : portfolios.filter(p => p.type === selectedType);

  const handleSubscribe = (portfolio: Portfolio) => {
    router.push(`/deposit?portfolio=${portfolio.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Plans</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPortfolios}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Investment Plans</h1>
            <p className="mt-2 text-gray-600">
              Choose the perfect trading bot subscription for your investment goals
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mt-8 flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
              {['all', 'Basic', 'Premium', 'Elite'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type === 'all' ? 'All Plans' : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredPortfolios.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-600">
              {selectedType === 'all' 
                ? 'No investment plans are currently available.'
                : `No ${selectedType} plans are currently available.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPortfolios.map((portfolio, index) => (
              <motion.div
                key={portfolio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border ${
                  portfolio.isElite ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                {/* Elite Badge */}
                {portfolio.isElite && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <StarIcon className="h-3 w-3 mr-1" />
                      ELITE
                    </div>
                  </div>
                )}

                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${typeColors[portfolio.type].gradient} p-6 text-white`}>
                  <h3 className="text-xl font-bold">{portfolio.name}</h3>
                  <p className="text-sm opacity-90 mt-1">{portfolio.description}</p>
                  
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{parseFloat(portfolio.dailyROI).toFixed(2)}%</div>
                    <div className="text-sm opacity-90">Daily ROI</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Investment Range */}
                  <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      Investment Range
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${parseFloat(portfolio.minInvestment).toLocaleString()} - ${parseFloat(portfolio.maxInvestment).toLocaleString()}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-6">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Duration
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {portfolio.durationValue} {portfolio.durationUnit}
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {portfolio.totalPossibleReturn.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Max Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {portfolio.totalSubscribers}
                      </div>
                      <div className="text-xs text-gray-600">Subscribers</div>
                    </div>
                  </div>

                  {/* Features */}
                  {portfolio.features && portfolio.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                      <ul className="space-y-2">
                        {portfolio.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start text-sm text-gray-600">
                            <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Availability Status */}
                  <div className="mb-6">
                    {portfolio.availabilityStatus === 'available' && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Available
                        {portfolio.remainingSlots > 0 && portfolio.remainingSlots !== -1 && (
                          <span className="ml-1">({portfolio.remainingSlots} slots left)</span>
                        )}
                      </div>
                    )}
                    {portfolio.availabilityStatus === 'full' && (
                      <div className="flex items-center text-sm text-orange-600">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Fully Subscribed
                      </div>
                    )}
                    {portfolio.availabilityStatus === 'unlimited' && (
                      <div className="flex items-center text-sm text-blue-600">
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Unlimited Slots
                      </div>
                    )}
                  </div>

                  {/* Subscription Fee */}
                  {portfolio.requiresSubscription && parseFloat(portfolio.subscriptionFee) > 0 && (
                    <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-800">
                        <strong>Subscription Fee:</strong> ${parseFloat(portfolio.subscriptionFee).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(portfolio)}
                    disabled={portfolio.availabilityStatus === 'full' || portfolio.availabilityStatus === 'unavailable'}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      portfolio.availabilityStatus === 'available' || portfolio.availabilityStatus === 'unlimited'
                        ? `bg-gradient-to-r ${typeColors[portfolio.type].gradient} text-white hover:opacity-90`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {portfolio.availabilityStatus === 'full' ? (
                      'Fully Subscribed'
                    ) : portfolio.availabilityStatus === 'unavailable' ? (
                      'Unavailable'
                    ) : (
                      <>
                        Subscribe Now
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}