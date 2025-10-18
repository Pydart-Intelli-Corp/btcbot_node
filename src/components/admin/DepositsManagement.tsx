'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DepositInfo {
  portfolio?: number;
  investmentAmount: number;
  paymentMethod: string;
  paymentProof?: string;
  senderAddress?: string;
  receiverAddress?: string;
  transactionHash?: string;
}

interface Deposit {
  id: number;
  transactionId: string;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  depositInfo: DepositInfo;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  processedAt?: string;
  approvedAt?: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
    phoneNumber: string;
  };
}

interface DepositsResponse {
  deposits: Deposit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const DepositsManagement = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [showDepositDetails, setShowDepositDetails] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingDeposits();
  }, [pagination.page]);

  const fetchPendingDeposits = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/admin/deposits/pending?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: { data: DepositsResponse } = await response.json();
        setDeposits(data.data.deposits);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveDeposit = async (depositId: number, notes: string) => {
    setProcessingId(depositId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        fetchPendingDeposits(); // Refresh the list
        setShowDepositDetails(false);
        setApprovalNotes('');
      }
    } catch (error) {
      console.error('Error approving deposit:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const rejectDeposit = async (depositId: number, reason: string) => {
    setProcessingId(depositId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchPendingDeposits(); // Refresh the list
        setShowDepositDetails(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const DepositCard = ({ deposit }: { deposit: Deposit }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {deposit.user.firstName} {deposit.user.lastName}
            </h3>
            <p className="text-sm text-gray-500">{deposit.user.email}</p>
            <p className="text-xs text-gray-400">ID: {deposit.transactionId}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(deposit.amount)}
          </p>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
            {getStatusIcon(deposit.status)}
            <span className="capitalize">{deposit.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Payment Method</p>
          <p className="font-medium text-sm">{deposit.depositInfo.paymentMethod}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Submitted</p>
          <p className="font-medium text-sm">{formatDate(deposit.createdAt)}</p>
        </div>
      </div>

      {deposit.depositInfo.senderAddress && (
        <div className="mb-3">
          <p className="text-xs text-gray-500">Sender Address</p>
          <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
            {deposit.depositInfo.senderAddress}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-2">
          {deposit.depositInfo.paymentProof && (
            <div className="flex items-center space-x-1 text-green-600">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs">Proof Attached</span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setSelectedDeposit(deposit);
            setShowDepositDetails(true);
          }}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span className="text-sm">Review</span>
        </button>
      </div>
    </motion.div>
  );

  const DepositDetailsModal = () => {
    if (!selectedDeposit) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Deposit Review - {selectedDeposit.transactionId}
              </h2>
              <button
                onClick={() => setShowDepositDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Information</span>
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">
                      {selectedDeposit.user.firstName} {selectedDeposit.user.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedDeposit.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-medium">{selectedDeposit.user.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Wallet Address</label>
                    <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                      {selectedDeposit.user.walletAddress || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Transaction Details</span>
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">Amount</label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedDeposit.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Currency</label>
                    <p className="font-medium">{selectedDeposit.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Payment Method</label>
                    <p className="font-medium">{selectedDeposit.depositInfo.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Submitted</label>
                    <p className="font-medium">{formatDate(selectedDeposit.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDeposit.depositInfo.senderAddress && (
                  <div>
                    <label className="text-sm text-gray-500">Sender Address</label>
                    <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                      {selectedDeposit.depositInfo.senderAddress}
                    </p>
                  </div>
                )}
                {selectedDeposit.depositInfo.receiverAddress && (
                  <div>
                    <label className="text-sm text-gray-500">Receiver Address</label>
                    <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                      {selectedDeposit.depositInfo.receiverAddress}
                    </p>
                  </div>
                )}
                {selectedDeposit.depositInfo.transactionHash && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Transaction Hash</label>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded flex-1">
                        {selectedDeposit.depositInfo.transactionHash}
                      </p>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <ExternalLink className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Proof */}
            {selectedDeposit.depositInfo.paymentProof && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Payment Proof</h3>
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg h-64">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Payment proof image</p>
                      <button className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                        View Full Size
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes (optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => approveDeposit(selectedDeposit.id, approvalNotes)}
                  disabled={processingId === selectedDeposit.id}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {processingId === selectedDeposit.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve Deposit</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => rejectDeposit(selectedDeposit.id, rejectionReason)}
                  disabled={processingId === selectedDeposit.id || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Reject Deposit</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Deposits</h1>
          <p className="text-gray-500">Review and approve user deposit requests</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{pagination.total} pending approvals</span>
        </div>
      </div>

      {/* Deposits List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading deposits...</span>
          </div>
        </div>
      ) : deposits.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {deposits.map((deposit) => (
            <DepositCard key={deposit.id} deposit={deposit} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No pending deposits to review at the moment</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
              {pagination.page}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Deposit Details Modal */}
      {showDepositDetails && <DepositDetailsModal />}
    </div>
  );
};

export default DepositsManagement;