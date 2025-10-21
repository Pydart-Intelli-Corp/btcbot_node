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
import AdminWalletSettings from '@/components/admin/AdminWalletSettings';
import AdminDepositsManagement from '@/components/admin/AdminDepositsManagement';

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
    { name: 'Wallet Settings', icon: Settings, path: 'wallet-settings' },
    { name: 'Deposit Management', icon: CreditCard, path: 'deposit-management' },
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
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 p-6 hover:border-slate-600 transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-sm text-gray-400 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          color === 'red' ? 'from-red-500 to-red-600' :
          color === 'purple' ? 'from-purple-500 to-purple-600' :
          'from-gray-500 to-gray-600'
        } shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const RecentTransactionItem = ({ transaction }: { transaction: any }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          transaction.type === 'deposit' ? 'bg-gradient-to-r from-green-500 to-green-600' :
          transaction.type === 'withdrawal' ? 'bg-gradient-to-r from-red-500 to-red-600' :
          'bg-gradient-to-r from-blue-500 to-blue-600'
        } shadow-lg`}>
          {transaction.type === 'deposit' ? (
            <TrendingUp className="h-4 w-4 text-white" />
          ) : transaction.type === 'withdrawal' ? (
            <Wallet className="h-4 w-4 text-white" />
          ) : (
            <DollarSign className="h-4 w-4 text-white" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {transaction.user?.firstName} {transaction.user?.lastName}
          </p>
          <p className="text-xs text-gray-400">
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          ${parseFloat(transaction.amount).toLocaleString()}
        </p>
        <div className="flex items-center space-x-1">
          {transaction.status === 'pending' && (
            <Clock className="h-3 w-3 text-yellow-400" />
          )}
          {transaction.status === 'completed' && (
            <CheckCircle className="h-3 w-3 text-green-400" />
          )}
          {transaction.status === 'rejected' && (
            <XCircle className="h-3 w-3 text-red-400" />
          )}
          <span className={`text-xs font-medium ${
            transaction.status === 'pending' ? 'text-yellow-400' :
            transaction.status === 'completed' ? 'text-green-400' :
            'text-red-400'
          }`}>
            {transaction.status}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-white">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 border-r border-slate-700`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">BTCBOT24 Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-white"
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
              className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-slate-700 transition-colors ${
                activeSection === item.path ? 'bg-blue-600 border-r-2 border-blue-400 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.count && item.count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-6 py-3 mt-6 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold text-white capitalize">
                {activeSection}
              </h2>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-300 capitalize">{user.role}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen">
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
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700">
                  <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                  </div>
                  <div className="p-6">
                    {stats.recentTransactions.length > 0 ? (
                      <div className="space-y-1">
                        {stats.recentTransactions.slice(0, 5).map((transaction) => (
                          <RecentTransactionItem key={transaction.id} transaction={transaction} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No recent transactions</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700">
                  <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {stats.pendingApprovals.deposits > 0 && (
                      <button
                        onClick={() => setActiveSection('deposits')}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-600 to-orange-600 border border-yellow-500 rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-white" />
                          <span className="font-medium text-white">
                            Review Pending Deposits
                          </span>
                        </div>
                        <span className="bg-white text-yellow-700 text-sm px-2 py-1 rounded font-bold">
                          {stats.pendingApprovals.deposits}
                        </span>
                      </button>
                    )}

                    {stats.pendingApprovals.withdrawals > 0 && (
                      <button
                        onClick={() => setActiveSection('withdrawals')}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-pink-600 border border-red-500 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-white" />
                          <span className="font-medium text-white">
                            Review Pending Withdrawals
                          </span>
                        </div>
                        <span className="bg-white text-red-700 text-sm px-2 py-1 rounded font-bold">
                          {stats.pendingApprovals.withdrawals}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveSection('users')}
                      className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      <Eye className="h-5 w-5 text-white" />
                      <span className="font-medium text-white">Manage Users</span>
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

          {activeSection === 'wallet-settings' && (
            <AdminWalletSettings />
          )}

          {activeSection === 'deposit-management' && (
            <AdminDepositsManagement />
          )}

          {/* Other sections placeholder */}
          {!['dashboard', 'users', 'deposits', 'withdrawals', 'referrals', 'wallet-settings', 'deposit-management'].includes(activeSection) && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 p-8 text-center">
              <div className="mb-4">
                <Settings className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Module
              </h3>
              <p className="text-gray-400">
                This section is under development. Advanced admin features coming soon.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;