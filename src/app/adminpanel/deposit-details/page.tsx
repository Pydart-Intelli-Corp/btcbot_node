'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  DocumentTextIcon,
  PhotoIcon,
  HashtagIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  ClipboardIcon
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
    walletBalance: number;
  };
  portfolio?: {
    id: number;
    name: string;
    type: string;
  };
}

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  proof_submitted: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  expired: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' }
};

export default function AdminDepositDetails() {
  const [deposit, setDeposit] = useState<DepositTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const router = useRouter();
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Get transaction ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setTransactionId(id);
      fetchDepositDetails(id);
    } else {
      setError('Transaction ID not provided');
      setLoading(false);
    }
  }, []);

  const fetchDepositDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/deposits/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDeposit(data.data);
        setAdminNotes(data.data.adminNotes || '');
      } else {
        setError(data.message || 'Failed to fetch deposit details');
      }
    } catch (err: any) {
      setError('Error fetching deposit details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!deposit) return;

    setActionLoading(true);
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
        setDeposit(prev => prev ? { ...prev, status: 'approved', completedAt: new Date().toISOString() } : null);
        alert('Deposit approved successfully!');
      } else {
        setError(data.message || 'Failed to approve deposit');
      }
    } catch (err: any) {
      setError('Error approving deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!deposit || !rejectReason.trim()) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/deposits/${deposit.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setDeposit(prev => prev ? { ...prev, status: 'rejected', notes: rejectReason.trim() } : null);
        setShowRejectModal(false);
        setRejectReason('');
        alert('Deposit rejected successfully!');
      } else {
        setError(data.message || 'Failed to reject deposit');
      }
    } catch (err: any) {
      setError('Error rejecting deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!deposit) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/deposits/${deposit.id}/notes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes })
      });

      const data = await response.json();
      if (data.success) {
        alert('Notes updated successfully!');
      } else {
        setError(data.message || 'Failed to update notes');
      }
    } catch (err: any) {
      setError('Error updating notes');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDisplay = (status: string) => {
    const colors = statusColors[status as keyof typeof statusColors] || statusColors.pending;
    const statusText = status.replace('_', ' ').toUpperCase();
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
        {status === 'pending' && <ClockIcon className="w-4 h-4 mr-2" />}
        {status === 'approved' && <CheckCircleIcon className="w-4 h-4 mr-2" />}
        {status === 'rejected' && <XCircleIcon className="w-4 h-4 mr-2" />}
        {statusText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !deposit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Deposit not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Deposit Details</h1>
                <p className="text-gray-600">Transaction ID: {deposit.transactionId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusDisplay(deposit.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Transaction Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(deposit.amount)}</div>
                  <div className="text-sm text-gray-500">{deposit.currency}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div>{getStatusDisplay(deposit.status)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <div className="text-sm text-gray-900">{formatDate(deposit.created_at)}</div>
                </div>
                
                {deposit.completedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Completed</label>
                    <div className="text-sm text-gray-900">{formatDate(deposit.completedAt)}</div>
                  </div>
                )}
              </div>

              {deposit.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-sm text-gray-900">{deposit.description}</p>
                </div>
              )}
            </div>

            {/* User Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">User Information</h3>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{deposit.user.firstName} {deposit.user.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{deposit.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referral Code</label>
                      <p className="mt-1 text-sm text-gray-900">{deposit.user.referralCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Wallet Balance</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(deposit.user.walletBalance)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Information */}
            {deposit.portfolio && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Investment Plan</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                    <p className="mt-1 text-sm text-gray-900">{deposit.portfolio.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Type</label>
                    <p className="mt-1 text-sm text-gray-900">{deposit.portfolio.type}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {deposit.depositInfo && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Information</h3>
                
                {/* Deposit breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Investment Amount</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(deposit.depositInfo.investmentAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform Fee</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(deposit.depositInfo.platformFee || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(deposit.depositInfo.totalAmount || deposit.amount)}
                    </p>
                  </div>
                </div>

                {/* Wallet addresses used */}
                {deposit.depositInfo.walletAddresses && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Admin Wallet Addresses</label>
                    <div className="space-y-3">
                      {Object.entries(deposit.depositInfo.walletAddresses).map(([currency, address]) => (
                        <div key={currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-sm text-gray-900">{currency}:</span>
                            <span className="ml-2 text-sm text-gray-600 font-mono">{address as string}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(address as string)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <ClipboardIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Proof */}
            {deposit.depositInfo?.paymentProof && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Proof</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <p className="mt-1 text-sm text-gray-900">{deposit.depositInfo.paymentProof.method}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(deposit.depositInfo.paymentProof.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  {deposit.depositInfo.paymentProof.transactionHash && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Hash</label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono break-all">
                          {deposit.depositInfo.paymentProof.transactionHash}
                        </code>
                        <button
                          onClick={() => copyToClipboard(deposit.depositInfo.paymentProof.transactionHash)}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <ClipboardIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {deposit.depositInfo.paymentProof.proofImage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Payment Screenshot</label>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <img 
                          src={deposit.depositInfo.paymentProof.proofImage} 
                          alt="Payment Proof"
                          className="max-w-full h-auto rounded-lg shadow-sm"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    </div>
                  )}

                  {deposit.depositInfo.paymentProof.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User Notes</label>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-900">{deposit.depositInfo.paymentProof.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Admin Notes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add internal notes about this deposit..."
                  />
                </div>
                
                <button
                  onClick={handleUpdateNotes}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Update Notes
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {(deposit.status === 'pending' || deposit.status === 'proof_submitted') && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Actions</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Processing...' : 'Approve Deposit'}
                  </button>
                  
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Reject Deposit
                  </button>
                </div>
              </div>
            )}

            {/* System Notes */}
            {deposit.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Notes</h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{deposit.notes}</p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium text-gray-900">{deposit.user.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-gray-900">#{deposit.id}</span>
                </div>
                {deposit.portfolio && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Portfolio ID:</span>
                    <span className="font-medium text-gray-900">{deposit.portfolio.id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Deposit</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
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
                    placeholder="Please provide a detailed reason for rejecting this deposit..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
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