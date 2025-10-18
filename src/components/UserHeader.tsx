'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  CreditCard, 
  TrendingUp,
  Settings,
  Users,
  DollarSign,
  History,
  Bell,
  RefreshCw,
  Crown
} from 'lucide-react';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  walletBalance: string;
  role: string;
  currentRank?: string;
}

const UserHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage or make API call
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    console.log('Logout initiated from header');
    
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userPreferences');
    
    // Clear any session storage as well
    sessionStorage.clear();
    
    console.log('All authentication data cleared');
    
    // Redirect to home page
    router.push('/');
    
    // Optional: Force page reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Refresh the page or trigger a data refresh
    window.location.reload();
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

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BTCBOT24
              </span>
              <p className="text-xs text-gray-500">Trading Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <TrendingUp size={18} />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/plans" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <CreditCard size={18} />
              <span>Plans</span>
            </Link>
            <Link 
              href="/transactions" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <History size={18} />
              <span>Transactions</span>
            </Link>
            <Link 
              href="/referrals" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Users size={18} />
              <span>Referrals</span>
            </Link>
          </div>

          {/* User Actions & Profile */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  ${parseFloat(user.walletBalance || '0').toFixed(2)}
                </span>
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  {user?.currentRank && (
                    <div className="flex items-center justify-end">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRankColor(user.currentRank)}`}>
                        <Crown className="h-3 w-3 mr-1" />
                        {user.currentRank}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user ? `${user.firstName} ${user.lastName}` : 'User'}
                    </p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Profile Settings</span>
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-700 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white/60 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-4">
            <div className="flex flex-col space-y-3">
              {/* Mobile User Info */}
              {user && (
                <div className="py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                      {user.currentRank && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRankColor(user.currentRank)}`}>
                          <Crown className="h-3 w-3 mr-1" />
                          {user.currentRank}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Wallet Balance</span>
                    <span className="font-semibold text-green-600">
                      ${parseFloat(user.walletBalance || '0').toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp size={18} />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                href="/plans" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <CreditCard size={18} />
                <span>Plans</span>
              </Link>
              
              <Link 
                href="/transactions" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <History size={18} />
                <span>Transactions</span>
              </Link>
              
              <Link 
                href="/referrals" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={18} />
                <span>Referrals</span>
              </Link>

              <div className="pt-3 border-t border-gray-200">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Profile Settings</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 w-full text-left text-red-600 hover:text-red-800 transition-colors py-2"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default UserHeader;