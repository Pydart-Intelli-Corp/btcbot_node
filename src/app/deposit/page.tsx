'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

interface DepositData {
  transactionId: string;
  portfolioId: number;
  portfolioName: string;
  investmentAmount: number;
  subscriptionFee: number;
  platformFee: number;
  totalAmount: number;
  walletAddresses: {
    [key: string]: string;
  };
  qrCodes: {
    [key: string]: string;
  };
  paymentMethods: string[];
  expiresAt: string;
  instructions: string[];
}

interface Portfolio {
  id: number;
  name: string;
  description: string;
  dailyROI: string;
  minInvestment: string;
  maxInvestment: string;
  type: string;
  subscriptionFee: string;
  requiresSubscription: boolean;
}

export default function DepositPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('USDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'amount' | 'payment' | 'proof'>('amount');
  const [proofData, setProofData] = useState({
    transactionHash: '',
    proofImage: '',
    notes: ''
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioId = searchParams?.get('portfolio');

  useEffect(() => {
    if (portfolioId) {
      fetchPortfolio(portfolioId);
    }
  }, [portfolioId]);

  const fetchPortfolio = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/portfolios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const selectedPortfolio = data.data.find((p: Portfolio) => p.id === parseInt(id));
        if (selectedPortfolio) {
          setPortfolio(selectedPortfolio);
          setInvestmentAmount(selectedPortfolio.minInvestment);
        } else {
          setError('Investment plan not found');
        }
      }
    } catch (err: any) {
      setError('Error loading investment plan');
    }
  };

  const handleInitializeDeposit = async () => {
    if (!portfolio || !investmentAmount) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/deposit/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          investmentAmount: parseFloat(investmentAmount)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setDepositData(data.data);
        setStep('payment');
      } else {
        setError(data.message || 'Error initializing deposit');
      }
    } catch (err: any) {
      setError('Error initializing deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!depositData) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/deposit/proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: depositData.transactionId,
          paymentMethod: selectedPaymentMethod,
          transactionHash: proofData.transactionHash,
          proofImage: proofData.proofImage,
          notes: proofData.notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('proof');
        alert('Payment proof submitted successfully! You will be notified once it\'s approved.');
        router.push('/dashboard');
      } else {
        setError(data.message || 'Error submitting payment proof');
      }
    } catch (err: any) {
      setError('Error submitting payment proof');
    } finally {
      setLoading(false);
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

  if (!portfolio) {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Investment Deposit</h1>
              <p className="text-gray-600">{portfolio.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Step 1: Amount Selection */}
            {step === 'amount' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Investment Amount</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Amount (USD)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        min={portfolio.minInvestment}
                        max={portfolio.maxInvestment}
                        step="0.01"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Range: {formatCurrency(parseFloat(portfolio.minInvestment))} - {formatCurrency(parseFloat(portfolio.maxInvestment))}
                    </p>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Fee Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Investment Amount:</span>
                        <span>{formatCurrency(parseFloat(investmentAmount) || 0)}</span>
                      </div>
                      {portfolio.requiresSubscription && (
                        <div className="flex justify-between">
                          <span>Subscription Fee:</span>
                          <span>{formatCurrency(parseFloat(portfolio.subscriptionFee))}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Platform Fee (2%):</span>
                        <span>{formatCurrency((parseFloat(investmentAmount) || 0) * 0.02)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>
                          {formatCurrency(
                            (parseFloat(investmentAmount) || 0) + 
                            (portfolio.requiresSubscription ? parseFloat(portfolio.subscriptionFee) : 0) +
                            ((parseFloat(investmentAmount) || 0) * 0.02)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleInitializeDeposit}
                    disabled={loading || !investmentAmount}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 'payment' && depositData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Payment Method Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Payment Method</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {depositData.paymentMethods.map((method) => (
                      <button
                        key={method}
                        onClick={() => setSelectedPaymentMethod(method)}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          selectedPaymentMethod === method
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{method}</div>
                      </button>
                    ))}
                  </div>

                  {/* Payment Details */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Payment Details</h3>
                      <span className="text-sm text-gray-600">
                        Expires: {new Date(depositData.expiresAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wallet Address ({selectedPaymentMethod})
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={depositData.walletAddresses[selectedPaymentMethod]}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(depositData.walletAddresses[selectedPaymentMethod])}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <ClipboardIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                          <img
                            src={depositData.qrCodes[selectedPaymentMethod]}
                            alt={`${selectedPaymentMethod} QR Code`}
                            className="w-48 h-48"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Scan QR code to copy wallet address
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Important:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Send exactly <strong>{formatCurrency(depositData.totalAmount)}</strong></li>
                              <li>Use {selectedPaymentMethod} network only</li>
                              <li>Double-check the wallet address</li>
                              <li>Keep your transaction hash/receipt</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('proof')}
                    className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    I've Sent the Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Upload Proof */}
            {step === 'proof' && depositData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Payment Proof</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Hash (Optional)
                    </label>
                    <input
                      type="text"
                      value={proofData.transactionHash}
                      onChange={(e) => setProofData({...proofData, transactionHash: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter transaction hash if available"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Screenshot/Receipt (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Upload screenshot or receipt of your payment
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setProofData({...proofData, proofImage: e.target?.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={proofData.notes}
                      onChange={(e) => setProofData({...proofData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional information about your payment"
                    />
                  </div>

                  <button
                    onClick={handleSubmitProof}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit Payment Proof'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Portfolio Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Investment Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{portfolio.name}</h4>
                  <p className="text-sm text-gray-600">{portfolio.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Daily ROI:</span>
                    <div className="font-semibold text-green-600">{parseFloat(portfolio.dailyROI).toFixed(2)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Plan Type:</span>
                    <div className="font-semibold">{portfolio.type}</div>
                  </div>
                </div>

                {depositData && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Investment:</span>
                        <span>{formatCurrency(depositData.investmentAmount)}</span>
                      </div>
                      {depositData.subscriptionFee > 0 && (
                        <div className="flex justify-between">
                          <span>Subscription:</span>
                          <span>{formatCurrency(depositData.subscriptionFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span>{formatCurrency(depositData.platformFee)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(depositData.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    <span>Secure & Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}