'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  CreditCard,
  Wallet,
  UserCheck,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import UsersManagement from '../../../components/admin/UsersManagement';
import DepositManagement from '../../../components/admin/DepositManagement';
import WithdrawalsManagement from '../../../components/admin/WithdrawalsManagement';
import ReferralManagement from '../../../components/admin/ReferralManagement';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
  };
  transactions: {
    total: number;
    pending: number;
    totalDeposits: number;
    totalWithdrawals: number;
  };
  portfolios: {
    active: number;
  };
  pendingApprovals: {
    deposits: number;
    withdrawals: number;
  };
  recentTransactions: any[];
}

interface NavigationItem {
  name: string;
  icon: any;
  path: string;
  count?: number;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchDashboardStats();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    const adminUser = localStorage.getItem('adminUser');

    if (!token || (userRole !== 'admin' && userRole !== 'superadmin')) {
      router.push('/adminpanel');
      return;
    }

    if (adminUser) {
      setUser(JSON.parse(adminUser));
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUser');
    router.push('/adminpanel');
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', icon: BarChart3, path: 'dashboard' },
    { name: 'Users', icon: Users, path: 'users' },
    { 
      name: 'Deposits', 
      icon: CreditCard, 
      path: 'deposits',
      count: stats?.pendingApprovals.deposits || 0
    },
    { 
      name: 'Withdrawals', 
      icon: Wallet, 
      path: 'withdrawals',
      count: stats?.pendingApprovals.withdrawals || 0
    },
    { name: 'Portfolios', icon: TrendingUp, path: 'portfolios' },
    { name: 'Referrals', icon: UserCheck, path: 'referrals' },
    { name: 'Reports', icon: Activity, path: 'reports' },
    { name: 'Settings', icon: Settings, path: 'settings' },
  ];

  const StatCard = ({ title, value, subtext, icon: Icon, color = 'blue' }: {
    title: string;
    value: string | number;
    subtext?: string;
    icon: any;
    color?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && (
            <p className="text-sm text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const RecentTransactionItem = ({ transaction }: { transaction: any }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          transaction.type === 'deposit' ? 'bg-green-100' :
          transaction.type === 'withdrawal' ? 'bg-red-100' :
          'bg-blue-100'
        }`}>
          {transaction.type === 'deposit' ? (
            <TrendingUp className={`h-4 w-4 ${
              transaction.type === 'deposit' ? 'text-green-600' :
              transaction.type === 'withdrawal' ? 'text-red-600' :
              'text-blue-600'
            }`} />
          ) : transaction.type === 'withdrawal' ? (
            <Wallet className="h-4 w-4 text-red-600" />
          ) : (
            <DollarSign className="h-4 w-4 text-blue-600" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {transaction.user?.firstName} {transaction.user?.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          ${parseFloat(transaction.amount).toLocaleString()}
        </p>
        <div className="flex items-center space-x-1">
          {transaction.status === 'pending' && (
            <Clock className="h-3 w-3 text-yellow-500" />
          )}
          {transaction.status === 'completed' && (
            <CheckCircle className="h-3 w-3 text-green-500" />
          )}
          {transaction.status === 'rejected' && (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span className={`text-xs ${
            transaction.status === 'pending' ? 'text-yellow-600' :
            transaction.status === 'completed' ? 'text-green-600' :
            'text-red-600'
          }`}>
            {transaction.status}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">BTCBOT24 Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setActiveSection(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-gray-50 ${
                activeSection === item.path ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.count && item.count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-6 py-3 mt-6 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeSection}
              </h2>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {activeSection === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.users.total}
                  subtext={`${stats.users.active} active`}
                  icon={Users}
                  color="blue"
                />
                <StatCard
                  title="Total Deposits"
                  value={`$${stats.transactions.totalDeposits.toLocaleString()}`}
                  subtext={`${stats.pendingApprovals.deposits} pending`}
                  icon={CreditCard}
                  color="green"
                />
                <StatCard
                  title="Total Withdrawals"
                  value={`$${stats.transactions.totalWithdrawals.toLocaleString()}`}
                  subtext={`${stats.pendingApprovals.withdrawals} pending`}
                  icon={Wallet}
                  color="red"
                />
                <StatCard
                  title="Active Portfolios"
                  value={stats.portfolios.active}
                  subtext="Investment plans"
                  icon={TrendingUp}
                  color="purple"
                />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  </div>
                  <div className="p-6">
                    {stats.recentTransactions.length > 0 ? (
                      <div className="space-y-1">
                        {stats.recentTransactions.slice(0, 5).map((transaction) => (
                          <RecentTransactionItem key={transaction.id} transaction={transaction} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent transactions</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {stats.pendingApprovals.deposits > 0 && (
                      <button
                        onClick={() => setActiveSection('deposits')}
                        className="w-full flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">
                            Review Pending Deposits
                          </span>
                        </div>
                        <span className="bg-yellow-500 text-white text-sm px-2 py-1 rounded">
                          {stats.pendingApprovals.deposits}
                        </span>
                      </button>
                    )}

                    {stats.pendingApprovals.withdrawals > 0 && (
                      <button
                        onClick={() => setActiveSection('withdrawals')}
                        className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-800">
                            Review Pending Withdrawals
                          </span>
                        </div>
                        <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                          {stats.pendingApprovals.withdrawals}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveSection('users')}
                      className="w-full flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Manage Users</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Section Rendering */}
          {activeSection === 'users' && (
            <UsersManagement />
          )}

          {activeSection === 'deposits' && (
            <DepositManagement />
          )}

          {activeSection === 'withdrawals' && (
            <WithdrawalsManagement />
          )}

          {activeSection === 'referrals' && (
            <ReferralManagement />
          )}

          {/* Other sections placeholder */}
          {!['dashboard', 'users', 'deposits', 'withdrawals', 'referrals'].includes(activeSection) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-4">
                <Settings className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Module
              </h3>
              <p className="text-gray-500">
                This section is under development. Advanced admin features coming soon.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;