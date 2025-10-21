const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, Portfolio, Transaction } = require('../models');
const { sequelize } = require('../config/database');
const { 
  asyncHandler, 
  validationError,
  notFoundError,
  unauthorizedError
} = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const QRCode = require('qrcode');
const crypto = require('crypto');

const router = express.Router();

// Import AdminWallet model from adminWallets route
const AdminWallet = sequelize.define('AdminWallet', {
  id: {
    type: sequelize.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  walletType: {
    type: sequelize.Sequelize.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['USDT', 'BTC', 'ETH', 'BNB', 'LTC', 'DOGE']]
    }
  },
  walletAddress: {
    type: sequelize.Sequelize.STRING(255),
    allowNull: false,
    validate: {
      len: [25, 255]
    }
  },
  qrCodeImage: {
    type: sequelize.Sequelize.TEXT,
    allowNull: true
  },
  isActive: {
    type: sequelize.Sequelize.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: sequelize.Sequelize.STRING(500),
    allowNull: false
  },
  networkType: {
    type: sequelize.Sequelize.STRING(50),
    allowNull: false,
    defaultValue: 'TRC20'
  },
  createdBy: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'admin_wallets',
  timestamps: true,
  underscored: true
});

// @desc    Get available payment methods and wallet addresses
// @route   GET /api/deposit/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  try {
    // Get active admin wallets
    const activeWallets = await AdminWallet.findAll({
      where: { isActive: true },
      attributes: ['id', 'walletType', 'walletAddress', 'qrCodeImage', 'networkType', 'description'],
      order: [['wallet_type', 'ASC']]
    });

    if (activeWallets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payment methods are currently available. Please contact support.'
      });
    }

    // Format for frontend
    const paymentMethods = activeWallets.map(wallet => ({
      id: wallet.id,
      currency: wallet.walletType,
      walletAddress: wallet.walletAddress,
      qrCodeImage: wallet.qrCodeImage,
      networkType: wallet.networkType,
      description: wallet.description
    }));

    res.status(200).json({
      success: true,
      data: paymentMethods,
      count: paymentMethods.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.logError('GET_PAYMENT_METHODS_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods'
    });
  }
});

// @desc    Get deposit information for a portfolio subscription
// @route   POST /api/deposit/initialize
// @access  Private
const initializeDeposit = asyncHandler(async (req, res) => {
  try {
    const { portfolioId, investmentAmount } = req.body;

    // Get portfolio details
    const portfolio = await Portfolio.findByPk(portfolioId);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    // Validate investment amount
    const amount = parseFloat(investmentAmount);
    const minInvestment = parseFloat(portfolio.minInvestment);
    const maxInvestment = parseFloat(portfolio.maxInvestment);

    if (amount < minInvestment || amount > maxInvestment) {
      return res.status(400).json({
        success: false,
        message: `Investment amount must be between $${minInvestment.toLocaleString()} and $${maxInvestment.toLocaleString()}`
      });
    }

    // Check availability
    if (portfolio.availableSlots !== -1 && portfolio.usedSlots >= portfolio.availableSlots) {
      return res.status(400).json({
        success: false,
        message: 'This investment plan is fully subscribed'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Transaction.findOne({
      where: {
        userId: req.user.id,
        type: 'deposit',
        category: 'investment',
        status: { [Op.in]: ['pending', 'completed'] }
      }
    });

    if (existingSubscription && existingSubscription.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You already have an active investment subscription'
      });
    }

    if (existingSubscription && existingSubscription.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You have a pending investment deposit. Please complete or cancel it first.'
      });
    }

    // Generate unique transaction ID
    const transactionId = 'DEP_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Get active admin wallets from AdminWallet table
    const activeWallets = await AdminWallet.findAll({
      where: { isActive: true },
      attributes: ['walletType', 'walletAddress', 'qrCodeImage', 'networkType'],
      order: [['wallet_type', 'ASC']]
    });

    // Build wallet addresses object
    const walletAddresses = {};
    const qrCodes = {};
    const availablePaymentMethods = [];

    // Default wallet addresses as fallback
    const defaultWallets = {
      'BTC': '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      'USDT': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5oREqwm',
      'ETH': '0x742d35Cc69B24E5e5b25E5b8F12B7a09F8d6b8c4',
      'BNB': 'bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64k'
    };

    if (activeWallets.length > 0) {
      // Use admin-configured wallets
      activeWallets.forEach(wallet => {
        walletAddresses[wallet.walletType] = wallet.walletAddress;
        availablePaymentMethods.push(wallet.walletType);
        
        if (wallet.qrCodeImage) {
          qrCodes[wallet.walletType] = wallet.qrCodeImage;
        }
      });
    } else {
      // Fallback to default wallets if no admin wallets configured
      Object.entries(defaultWallets).forEach(([currency, address]) => {
        walletAddresses[currency] = address;
        availablePaymentMethods.push(currency);
      });
    }

    // Generate QR codes for wallets that don't have uploaded QR codes
    for (const currency of availablePaymentMethods) {
      if (!qrCodes[currency]) {
        try {
          qrCodes[currency] = await QRCode.toDataURL(walletAddresses[currency]);
        } catch (error) {
          console.error(`Error generating QR code for ${currency}:`, error);
          // Use a placeholder or skip this currency
          qrCodes[currency] = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" font-size="12">QR Code Error</text></svg>').toString('base64')}`;
        }
      }
    }

    // Calculate fees and totals
    const subscriptionFee = portfolio.requiresSubscription ? parseFloat(portfolio.subscriptionFee) : 0;
    const platformFee = amount * 0.02; // 2% platform fee
    const totalAmount = amount + subscriptionFee + platformFee;

    // Create pending transaction
    const depositInfo = {
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      investmentAmount: amount,
      subscriptionFee: subscriptionFee,
      platformFee: platformFee,
      totalAmount: totalAmount,
      walletAddresses: walletAddresses,
        qrCodes: qrCodes,
        paymentMethods: availablePaymentMethods,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    const transaction = await Transaction.create({
      transactionId: transactionId,
      userId: req.user.id,
      type: 'deposit',
      category: 'investment',
      amount: totalAmount,
      currency: 'USD',
      status: 'pending',
      description: `Investment deposit for ${portfolio.name}`,
      depositInfo: depositInfo,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      balanceBefore: parseFloat(req.user.walletBalance),
      balanceAfter: parseFloat(req.user.walletBalance), // Will be updated after approval
      initiatedAt: new Date()
    });

    logger.logUserAction(req.user.id, 'DEPOSIT_INITIALIZED', {
      transactionId: transaction.transactionId,
      portfolioId: portfolio.id,
      amount: totalAmount
    });

    res.status(200).json({
      success: true,
      message: 'Deposit initialized successfully',
      data: {
        transactionId: transaction.transactionId,
        portfolioId: portfolio.id,
        portfolioName: portfolio.name,
        investmentAmount: amount,
        subscriptionFee: subscriptionFee,
        platformFee: platformFee,
        totalAmount: totalAmount,
        walletAddresses: walletAddresses,
        qrCodes: qrCodes,
        paymentMethods: availablePaymentMethods,
        expiresAt: depositInfo.expiresAt,
        instructions: [
          'Choose your preferred cryptocurrency payment method',
          'Send the exact amount to the provided wallet address',
          'Upload your payment proof (screenshot/transaction hash)',
          'Wait for admin approval (usually within 24 hours)',
          'Your investment will be activated after approval'
        ]
      }
    });

  } catch (error) {
    logger.logError('INITIALIZE_DEPOSIT_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing deposit',
      error: error.message
    });
  }
});

// @desc    Upload payment proof for deposit
// @route   POST /api/deposit/proof
// @access  Private
const uploadPaymentProof = asyncHandler(async (req, res) => {
  try {
    const { transactionId, paymentMethod, transactionHash, proofImage, notes } = req.body;

    // Find the transaction
    const transaction = await Transaction.findOne({
      where: {
        transactionId: transactionId,
        userId: req.user.id,
        type: 'deposit',
        status: 'pending'
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Deposit transaction not found or already processed'
      });
    }

    // Check if deposit has expired
    const depositInfo = transaction.depositInfo;
    if (new Date() > new Date(depositInfo.expiresAt)) {
      await transaction.update({ status: 'expired' });
      return res.status(400).json({
        success: false,
        message: 'Deposit has expired. Please create a new deposit.'
      });
    }

    // Update deposit info with payment proof
    const updatedDepositInfo = {
      ...depositInfo,
      paymentProof: {
        method: paymentMethod,
        transactionHash: transactionHash,
        proofImage: proofImage,
        notes: notes,
        uploadedAt: new Date()
      }
    };

    await transaction.update({
      depositInfo: updatedDepositInfo,
      status: 'proof_submitted',
      notes: `Payment proof uploaded via ${paymentMethod}` + (notes ? `. Notes: ${notes}` : '')
    });

    logger.logUserAction(req.user.id, 'PAYMENT_PROOF_UPLOADED', {
      transactionId: transaction.transactionId,
      paymentMethod: paymentMethod,
      transactionHash: transactionHash
    });

    res.status(200).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: {
        transactionId: transaction.transactionId,
        status: 'proof_submitted',
        message: 'Your payment proof has been submitted for review. You will be notified once it\'s approved.'
      }
    });

  } catch (error) {
    logger.logError('UPLOAD_PAYMENT_PROOF_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment proof',
      error: error.message
    });
  }
});

// @desc    Get user's deposit history
// @route   GET /api/deposit/history
// @access  Private
const getDepositHistory = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = { 
      userId: req.user.id,
      type: 'deposit'
    };
    if (status) whereConditions.status = status;

    const deposits = await Transaction.findAndCountAll({
      where: whereConditions,
      attributes: [
        'id', 'transactionId', 'amount', 'currency', 'status',
        'description', 'depositInfo', 'created_at', 'completedAt',
        'notes'
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: deposits.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(deposits.count / limit),
        totalDeposits: deposits.count,
        hasMore: offset + deposits.rows.length < deposits.count
      }
    });

  } catch (error) {
    logger.logError('GET_DEPOSIT_HISTORY_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deposit history',
      error: error.message
    });
  }
});

// @desc    Cancel pending deposit
// @route   POST /api/deposit/cancel
// @access  Private
const cancelDeposit = asyncHandler(async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findOne({
      where: {
        transactionId: transactionId,
        userId: req.user.id,
        type: 'deposit',
        status: { [Op.in]: ['pending', 'proof_submitted'] }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Deposit transaction not found or cannot be cancelled'
      });
    }

    await transaction.update({
      status: 'cancelled',
      notes: (transaction.notes || '') + ' | Cancelled by user'
    });

    logger.logUserAction(req.user.id, 'DEPOSIT_CANCELLED', {
      transactionId: transaction.transactionId
    });

    res.status(200).json({
      success: true,
      message: 'Deposit cancelled successfully'
    });

  } catch (error) {
    logger.logError('CANCEL_DEPOSIT_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling deposit',
      error: error.message
    });
  }
});

// Register routes
router.get('/payment-methods', protect, getPaymentMethods);
router.post('/initialize', protect, [
  body('portfolioId').isInt().withMessage('Valid portfolio ID is required'),
  body('investmentAmount').isFloat({ min: 1 }).withMessage('Valid investment amount is required')
], validationError, initializeDeposit);

router.post('/proof', protect, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('paymentMethod').custom(async (value) => {
    // Validate payment method against active admin wallets
    const activeWallet = await AdminWallet.findOne({
      where: { 
        walletType: value.toUpperCase(),
        isActive: true 
      }
    });
    if (!activeWallet) {
      throw new Error('Invalid or inactive payment method');
    }
    return true;
  }),
  body('transactionHash').optional().trim(),
  body('proofImage').optional().trim(),
  body('notes').optional().trim().isLength({ max: 500 })
], validationError, uploadPaymentProof);

router.get('/history', protect, getDepositHistory);
router.post('/cancel', protect, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], validationError, cancelDeposit);

module.exports = router;