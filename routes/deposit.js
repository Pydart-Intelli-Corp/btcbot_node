const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User, Portfolio, Transaction } = require('../models');
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

    // Create wallet addresses for different cryptocurrencies
    const walletAddresses = {
      BTC: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      USDT: '0x742d35cc6731c0532925a3b8d4c0a4df5c3f1234',
      ETH: '0x742d35cc6731c0532925a3b8d4c0a4df5c3f1234',
      BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'
    };

    // Generate QR codes for each wallet
    const qrCodes = {};
    for (const [currency, address] of Object.entries(walletAddresses)) {
      qrCodes[currency] = await QRCode.toDataURL(address);
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
      paymentMethods: ['BTC', 'USDT', 'ETH', 'BNB'],
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
        paymentMethods: ['BTC', 'USDT', 'ETH', 'BNB'],
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
router.post('/initialize', protect, [
  body('portfolioId').isInt().withMessage('Valid portfolio ID is required'),
  body('investmentAmount').isFloat({ min: 1 }).withMessage('Valid investment amount is required')
], validationError, initializeDeposit);

router.post('/proof', protect, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('paymentMethod').isIn(['BTC', 'USDT', 'ETH', 'BNB']).withMessage('Valid payment method is required'),
  body('transactionHash').optional().trim(),
  body('proofImage').optional().trim(),
  body('notes').optional().trim().isLength({ max: 500 })
], validationError, uploadPaymentProof);

router.get('/history', protect, getDepositHistory);
router.post('/cancel', protect, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], validationError, cancelDeposit);

module.exports = router;