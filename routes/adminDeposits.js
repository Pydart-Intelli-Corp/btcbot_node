const express = require('express');
const router = express.Router();
const { User, Transaction, Portfolio } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all deposit requests with user and portfolio details
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const where = { type: 'deposit' };
    if (status && status !== 'all') {
      where.status = status;
    }

    const deposits = await Transaction.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'referralCode']
        },
        {
          model: Portfolio,
          as: 'portfolio',
          attributes: ['id', 'name', 'type']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    logger.info(`Admin ${req.user.id} viewed deposit requests`, {
      adminId: req.user.id,
      depositsCount: deposits.length,
      filters: { status, page, limit }
    });

    res.json({
      success: true,
      message: 'Deposits retrieved successfully',
      data: deposits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: deposits.length
      }
    });

  } catch (error) {
    logger.error('Error fetching deposits:', {
      error: error.message,
      stack: error.stack,
      adminId: req.user.id
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching deposits'
    });
  }
});

// Get deposit statistics
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalDeposits,
      pendingDeposits,
      approvedDeposits,
      rejectedDeposits,
      totalDepositAmount,
      todayDeposits
    ] = await Promise.all([
      Transaction.count({ where: { type: 'deposit' } }),
      Transaction.count({ where: { type: 'deposit', status: 'pending' } }),
      Transaction.count({ where: { type: 'deposit', status: 'approved' } }),
      Transaction.count({ where: { type: 'deposit', status: 'rejected' } }),
      Transaction.sum('amount', { where: { type: 'deposit', status: 'approved' } }),
      Transaction.count({
        where: {
          type: 'deposit',
          created_at: {
            [require('sequelize').Op.gte]: new Date().setHours(0, 0, 0, 0)
          }
        }
      })
    ]);

    const stats = {
      totalDeposits,
      pendingDeposits,
      approvedDeposits,
      rejectedDeposits,
      totalDepositAmount: totalDepositAmount || 0,
      todayDeposits
    };

    logger.info(`Admin ${req.user.id} viewed deposit statistics`, {
      adminId: req.user.id,
      stats
    });

    res.json({
      success: true,
      message: 'Deposit statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching deposit statistics:', {
      error: error.message,
      stack: error.stack,
      adminId: req.user.id
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching deposit statistics'
    });
  }
});

// Approve deposit
router.post('/:transactionId/approve', protect, adminOnly, async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the deposit transaction
    const deposit = await Transaction.findOne({
      where: {
        id: transactionId,
        type: 'deposit',
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Portfolio,
          as: 'portfolio'
        }
      ]
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found or already processed'
      });
    }

    // Update deposit status
    await deposit.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    // Update user wallet balance
    const user = deposit.user;
    await user.update({
      walletBalance: parseFloat(user.walletBalance) + parseFloat(deposit.investmentAmount),
      totalDeposited: parseFloat(user.totalDeposited) + parseFloat(deposit.amount)
    });

    // Process referral commissions (we'll implement this later)
    // await processReferralCommissions(deposit);

    logger.info('Deposit approved successfully', {
      transactionId: deposit.id,
      userId: deposit.userId,
      amount: deposit.amount,
      approvedBy: req.user.id,
      adminEmail: req.user.email
    });

    res.json({
      success: true,
      message: 'Deposit approved successfully',
      data: {
        transactionId: deposit.id,
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('Error approving deposit:', {
      error: error.message,
      stack: error.stack,
      transactionId: req.params.transactionId,
      adminId: req.user.id
    });

    res.status(500).json({
      success: false,
      message: 'Error approving deposit'
    });
  }
});

// Reject deposit
router.post('/:transactionId/reject', protect, adminOnly, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Find the deposit transaction
    const deposit = await Transaction.findOne({
      where: {
        id: transactionId,
        type: 'deposit',
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found or already processed'
      });
    }

    // Update deposit status
    await deposit.update({
      status: 'rejected',
      rejectedBy: req.user.id,
      rejectedAt: new Date(),
      rejectionReason: reason.trim()
    });

    logger.info('Deposit rejected', {
      transactionId: deposit.id,
      userId: deposit.userId,
      amount: deposit.amount,
      rejectedBy: req.user.id,
      adminEmail: req.user.email,
      reason: reason.trim()
    });

    res.json({
      success: true,
      message: 'Deposit rejected successfully',
      data: {
        transactionId: deposit.id,
        status: 'rejected',
        rejectedBy: req.user.id,
        rejectedAt: new Date(),
        reason: reason.trim()
      }
    });

  } catch (error) {
    logger.error('Error rejecting deposit:', {
      error: error.message,
      stack: error.stack,
      transactionId: req.params.transactionId,
      adminId: req.user.id
    });

    res.status(500).json({
      success: false,
      message: 'Error rejecting deposit'
    });
  }
});

// Get deposit details
router.get('/:transactionId', protect, adminOnly, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const deposit = await Transaction.findOne({
      where: {
        id: transactionId,
        type: 'deposit'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'referralCode', 'walletBalance']
        },
        {
          model: Portfolio,
          as: 'portfolio'
        }
      ]
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    logger.info(`Admin ${req.user.id} viewed deposit details`, {
      adminId: req.user.id,
      transactionId: deposit.id
    });

    res.json({
      success: true,
      message: 'Deposit details retrieved successfully',
      data: deposit
    });

  } catch (error) {
    logger.error('Error fetching deposit details:', {
      error: error.message,
      stack: error.stack,
      transactionId: req.params.transactionId,
      adminId: req.user.id
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching deposit details'
    });
  }
});

// Update deposit notes (admin can add internal notes)
router.put('/:transactionId/notes', protect, adminOnly, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    const deposit = await Transaction.findOne({
      where: {
        id: transactionId,
        type: 'deposit'
      }
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    await deposit.update({
      adminNotes: adminNotes || '',
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date()
    });

    logger.info('Deposit notes updated', {
      transactionId: deposit.id,
      modifiedBy: req.user.id,
      adminEmail: req.user.email
    });

    res.json({
      success: true,
      message: 'Deposit notes updated successfully',
      data: {
        transactionId: deposit.id,
        adminNotes: adminNotes,
        lastModifiedBy: req.user.id,
        lastModifiedAt: new Date()
      }
    });

  } catch (error) {
    logger.error('Error updating deposit notes:', {
      error: error.message,
      stack: error.stack,
      transactionId: req.params.transactionId,
      adminId: req.user.id
    });

    res.status(500).json({
      success: false,
      message: 'Error updating deposit notes'
    });
  }
});

module.exports = router;