'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Wallet, 
  TrendingUp, 
  Users, 
  Gift, 
  History, 
  Settings, 
  LogOut, 
  Copy, 
  ExternalLink,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  Award,
  Bell,
  Eye,
  EyeOff,
  DollarSign,
  Activity,
  Zap,
  Target,
  Calendar,
  BarChart3,
  TrendingDown,
  Plus,
  Minus,
  ChevronRight,
  Star,
  Shield,
  RefreshCw
} from 'lucide-react';

interface DashboardUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  referralCode: string;
  walletBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
  totalCommissions: number;
  currentRank: string;
  directReferrals: number;
  totalReferrals: number;
  subscriptionStatus: string;
  isProfileComplete: boolean;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [userResponse, transactionsResponse] = await Promise.all([
        fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/user/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data);
        setReferralLink(`${window.location.origin}/register?ref=${userData.data.referralCode}`);
      }

      if (transactionsResponse.ok) {
        const transactionData = await transactionsResponse.json();
        setTransactions(transactionData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    router.push('/');
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      // Use a more modern toast notification instead of alert
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
      toast.textContent = 'Referral link copied to clipboard!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const getRankColor = (rank: string) => {
    const colors = {
      'Bronze': 'text-orange-600 bg-orange-100',
      'Silver': 'text-gray-600 bg-gray-100',
      'Gold': 'text-yellow-600 bg-yellow-100',
      'Platinum': 'text-blue-600 bg-blue-100',
      'Diamond': 'text-purple-600 bg-purple-100'
    };
    return colors[rank as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'completed': 'text-green-600 bg-green-100',
      'processing': 'text-blue-600 bg-blue-100',
      'failed': 'text-red-600 bg-red-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Dashboard</h2>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName}! 👋
              </h2>
              <p className="text-gray-600 text-lg">
                Here's your portfolio overview and recent activity
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Current Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Wallet Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <button
                    onClick={toggleBalanceVisibility}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  +12.5%
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalance ? `$${parseFloat(user.walletBalance.toString()).toFixed(2)}` : '•••••'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Available for withdrawal</p>
            </div>
          </motion.div>

          {/* Total Earnings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  +8.2%
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                {showBalance ? `$${parseFloat(user.totalEarnings.toString()).toFixed(2)}` : '•••••'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Lifetime earnings</p>
            </div>
          </motion.div>

          {/* Referrals Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  +{user.directReferrals} new
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Referrals</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-purple-600">
                  {user.totalReferrals}
                </p>
                <p className="text-sm text-gray-500">
                  ({user.directReferrals} direct)
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Active network members</p>
            </div>
          </motion.div>

          {/* Commissions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Gift className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                  +15.3%
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Commissions</p>
              <p className="text-2xl font-bold text-indigo-600">
                {showBalance ? `$${parseFloat(user.totalCommissions.toString()).toFixed(2)}` : '•••••'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Referral commissions earned</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Portfolio Overview</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    ROI: <span className="text-green-600 font-semibold">+18.5%</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${parseFloat(user.totalDeposited.toString()).toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Profit Generated</p>
                  <p className="text-xl font-bold text-green-600">
                    ${(parseFloat(user.totalEarnings.toString()) - parseFloat(user.totalDeposited.toString())).toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                  <p className="text-xl font-bold text-purple-600">92.4%</p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Referral Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Referral Program</h3>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">Premium Member</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Your Unique Referral Link</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm font-mono"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 transform hover:scale-105"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="font-medium">Copy</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Commission Rate</p>
                  <p className="text-lg font-bold text-green-600">10%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Bonus Levels</p>
                  <p className="text-lg font-bold text-purple-600">5 Tiers</p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <button 
                  onClick={() => router.push('/transactions')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.slice(0, 4).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30 hover:bg-white/70 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          transaction.type === 'deposit' ? 'bg-green-100' : 
                          transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <Plus className="h-5 w-5 text-green-600" />
                          ) : transaction.type === 'withdrawal' ? (
                            <Minus className="h-5 w-5 text-red-600" />
                          ) : (
                            <Gift className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          transaction.type === 'deposit' || transaction.type === 'commission' 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'commission' ? '+' : '-'}
                          ${parseFloat(transaction.amount.toString()).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No transactions yet</p>
                    <p className="text-gray-400 text-sm">Your trading activity will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification</span>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Verified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile</span>
                  <span className={`text-sm font-medium ${user.isProfileComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user.isProfileComplete ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trading Bot</span>
                  <span className={`text-sm font-medium ${
                    user.subscriptionStatus === 'active' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {user.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Profile Completion Alert */}
            {!user.isProfileComplete && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-6"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-yellow-800">Profile Incomplete</h3>
                </div>
                <p className="text-sm text-yellow-700 mb-4">
                  Complete your profile to unlock withdrawals and premium features.
                </p>
                <button 
                  onClick={() => router.push('/profile')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 font-medium"
                >
                  Complete Now →
                </button>
              </motion.div>
            )}

            {/* Enhanced Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/deposit')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Make Deposit</span>
                </button>
                
                <button 
                  onClick={() => router.push('/plans')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
                >
                  <Zap className="h-4 w-4" />
                  <span>Trading Plans</span>
                </button>
                
                <button 
                  onClick={() => router.push('/referrals')}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
                >
                  <Users className="h-4 w-4" />
                  <span>My Network</span>
                </button>
                
                <button 
                  onClick={() => router.push('/profile')}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </motion.div>

            {/* Enhanced Subscription Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trading Bot Status</h3>
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                  user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                  user.subscriptionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <Activity className="h-4 w-4 mr-2" />
                  {user.subscriptionStatus === 'none' ? 'No Active Plan' : 
                   user.subscriptionStatus === 'active' ? 'Bot Active' : 
                   user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
                </div>
                
                {user.subscriptionStatus === 'active' ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium mb-2">
                      🤖 Your bot is actively trading
                    </p>
                    <p className="text-xs text-green-600">
                      Generating returns automatically
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      Choose a plan to activate your bot
                    </p>
                    <button 
                      onClick={() => router.push('/plans')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Available Plans →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;