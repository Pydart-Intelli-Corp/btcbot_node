'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PhotoIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

interface DepositTransaction {
  id: number;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  depositInfo: any;
  created_at: string;
  completedAt: string | null;
  notes: string | null;
  adminNotes: string | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
  };
  portfolio?: {
    id: number;
    name: string;
    type: string;
  };
}

interface DepositStats {
  totalDeposits: number;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  totalDepositAmount: number;
  todayDeposits: number;
}

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  proof_submitted: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  expired: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' }
};

export default function AdminDepositsManagement() {
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [stats, setStats] = useState<DepositStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositTransaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [depositToReject, setDepositToReject] = useState<DepositTransaction | null>(null);

  useEffect(() => {
    fetchDeposits();
    fetchStats();
  }, [selectedStatus]);

  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/deposits?status=${selectedStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDeposits(data.data);
      } else {
        setError(data.message || 'Failed to fetch deposits');
      }
    } catch (err: any) {
      setError('Error fetching deposits');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/deposits/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApproveDeposit = async (deposit: DepositTransaction) => {
    setActionLoading(`approve-${deposit.id}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/deposits/${deposit.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDeposits(prevDeposits => 
          prevDeposits.map(d => 
            d.id === deposit.id 
              ? { ...d, status: 'approved', completedAt: new Date().toISOString() }
              : d
          )
        );
        alert('Deposit approved successfully!');
        fetchStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to approve deposit');
      }
    } catch (err: any) {
      setError('Error approving deposit');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectDeposit = async () => {
    if (!depositToReject || !rejectReason.trim()) return;

    setActionLoading(`reject-${depositToReject.id}`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/deposits/${depositToReject.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setDeposits(prevDeposits => 
          prevDeposits.map(d => 
            d.id === depositToReject.id 
              ? { ...d, status: 'rejected', notes: rejectReason.trim() }
              : d
          )
        );
        setShowRejectModal(false);
        setDepositToReject(null);
        setRejectReason('');
        alert('Deposit rejected successfully!');
        fetchStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to reject deposit');
      }
    } catch (err: any) {
      setError('Error rejecting deposit');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDisplay = (status: string) => {
    const colors = statusColors[status as keyof typeof statusColors] || statusColors.pending;
    const statusText = status.replace('_', ' ').toUpperCase();
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
        {status === 'pending' && <ClockIcon className="w-3 h-3 mr-1" />}
        {status === 'approved' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {status === 'rejected' && <XCircleIcon className="w-3 h-3 mr-1" />}
        {statusText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Deposits</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeposits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDeposits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedDeposits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.rejectedDeposits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDepositAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Today</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDeposits}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="proof_submitted">Proof Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={fetchDeposits}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Deposits Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Deposit Requests</h3>
        </div>

        {deposits.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Deposits Found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' ? 'No deposit requests available.' : `No ${selectedStatus} deposits found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portfolio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {deposit.user.firstName} {deposit.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{deposit.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(deposit.amount)}</div>
                      <div className="text-sm text-gray-500">{deposit.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deposit.portfolio?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{deposit.portfolio?.type || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusDisplay(deposit.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(deposit.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDeposit(deposit);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {(deposit.status === 'pending' || deposit.status === 'proof_submitted') && (
                        <>
                          <button
                            onClick={() => handleApproveDeposit(deposit)}
                            disabled={actionLoading === `approve-${deposit.id}`}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setDepositToReject(deposit);
                              setShowRejectModal(true);
                            }}
                            disabled={actionLoading === `reject-${deposit.id}`}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Details Modal */}
      {showDetailsModal && selectedDeposit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Deposit Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDeposit.transactionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusDisplay(selectedDeposit.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedDeposit.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDeposit.created_at)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User Details</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{selectedDeposit.user.firstName} {selectedDeposit.user.lastName}</p>
                    <p className="text-gray-600">{selectedDeposit.user.email}</p>
                    <p className="text-gray-600">Referral Code: {selectedDeposit.user.referralCode}</p>
                  </div>
                </div>

                {selectedDeposit.depositInfo?.paymentProof && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Payment Proof</h4>
                    
                    {selectedDeposit.depositInfo.paymentProof.method && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDeposit.depositInfo.paymentProof.method}</p>
                      </div>
                    )}

                    {selectedDeposit.depositInfo.paymentProof.transactionHash && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Transaction Hash</label>
                        <p className="mt-1 text-sm text-gray-900 break-all">{selectedDeposit.depositInfo.paymentProof.transactionHash}</p>
                      </div>
                    )}

                    {selectedDeposit.depositInfo.paymentProof.proofImage && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Screenshot</label>
                        <img 
                          src={selectedDeposit.depositInfo.paymentProof.proofImage} 
                          alt="Payment Proof"
                          className="max-w-full h-auto border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}

                    {selectedDeposit.depositInfo.paymentProof.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User Notes</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDeposit.depositInfo.paymentProof.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedDeposit.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDeposit.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && depositToReject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Deposit</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setDepositToReject(null);
                    setRejectReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide a reason for rejecting this deposit..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setDepositToReject(null);
                    setRejectReason('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectDeposit}
                  disabled={!rejectReason.trim() || Boolean(actionLoading)}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Deposit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}