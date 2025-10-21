'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PhotoIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface DepositRequest {
  id: number;
  transactionId: string;
  userId: number;
  portfolioId: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    referralCode: string;
  };
  portfolio: {
    name: string;
    type: string;
  };
  investmentAmount: number;
  subscriptionFee: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: string;
  transactionHash: string;
  proofImage: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function DepositManagement() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/deposits', {
        headers: {
          'Authorization': `Bearer ${token}`
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

  const handleApproveDeposit = async (depositId: number) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchDeposits(); // Refresh the list
        setSelectedDeposit(null);
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

  const handleRejectDeposit = async (depositId: number, reason: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        await fetchDeposits(); // Refresh the list
        setSelectedDeposit(null);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDeposits = filterStatus === 'all' 
    ? deposits 
    : deposits.filter(d => d.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deposit Management</h1>
              <p className="text-gray-600">Review and manage user deposit requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={fetchDeposits}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Deposits List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Deposit Requests ({filteredDeposits.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredDeposits.length > 0 ? (
                  filteredDeposits.map((deposit) => (
                    <motion.div
                      key={deposit.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedDeposit?.id === deposit.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDeposit(deposit)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {deposit.user.firstName} {deposit.user.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{deposit.user.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(deposit.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Portfolio:</span>
                          <p className="font-medium">{deposit.portfolio.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <p className="font-medium">{formatCurrency(deposit.totalAmount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Method:</span>
                          <p className="font-medium">{deposit.paymentMethod}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <p className="font-medium">{new Date(deposit.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <DocumentMagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No deposit requests found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Deposit Details */}
          <div className="lg:col-span-1">
            {selectedDeposit ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Deposit Details</h3>
                  {getStatusBadge(selectedDeposit.status)}
                </div>

                <div className="space-y-6">
                  {/* User Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600">Name:</span> {selectedDeposit.user.firstName} {selectedDeposit.user.lastName}</p>
                      <p><span className="text-gray-600">Email:</span> {selectedDeposit.user.email}</p>
                      <p><span className="text-gray-600">Referral Code:</span> {selectedDeposit.user.referralCode}</p>
                    </div>
                  </div>

                  {/* Investment Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Investment Details</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600">Portfolio:</span> {selectedDeposit.portfolio.name}</p>
                      <p><span className="text-gray-600">Type:</span> {selectedDeposit.portfolio.type}</p>
                      <p><span className="text-gray-600">Investment:</span> {formatCurrency(selectedDeposit.investmentAmount)}</p>
                      {selectedDeposit.subscriptionFee > 0 && (
                        <p><span className="text-gray-600">Subscription Fee:</span> {formatCurrency(selectedDeposit.subscriptionFee)}</p>
                      )}
                      <p><span className="text-gray-600">Platform Fee:</span> {formatCurrency(selectedDeposit.platformFee)}</p>
                      <p className="font-semibold"><span className="text-gray-600">Total Amount:</span> {formatCurrency(selectedDeposit.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600">Method:</span> {selectedDeposit.paymentMethod}</p>
                      {selectedDeposit.transactionHash && (
                        <div>
                          <span className="text-gray-600">Transaction Hash:</span>
                          <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded mt-1">
                            {selectedDeposit.transactionHash}
                          </p>
                        </div>
                      )}
                      {selectedDeposit.notes && (
                        <div>
                          <span className="text-gray-600">Notes:</span>
                          <p className="bg-gray-50 p-2 rounded mt-1">{selectedDeposit.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Proof */}
                  {selectedDeposit.proofImage && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Proof</h4>
                      <div className="border border-gray-200 rounded-lg p-2">
                        <img
                          src={selectedDeposit.proofImage}
                          alt="Payment Proof"
                          className="w-full h-32 object-cover rounded"
                        />
                        <button className="w-full mt-2 text-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center px-3 py-2 rounded-lg transition-colors">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Full Size
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedDeposit.status === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium text-gray-900">Actions</h4>
                      <button
                        onClick={() => handleApproveDeposit(selectedDeposit.id)}
                        disabled={actionLoading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        {actionLoading ? 'Processing...' : 'Approve Deposit'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            handleRejectDeposit(selectedDeposit.id, reason);
                          }
                        }}
                        disabled={actionLoading}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Reject Deposit
                      </button>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 pt-4 border-t">
                    <p>Created: {new Date(selectedDeposit.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedDeposit.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <InformationCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Select a deposit request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}