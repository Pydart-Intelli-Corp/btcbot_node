const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { 
  asyncHandler, 
  validationError,
  notFoundError,
  authError 
} = require('../middleware/errorHandler');
const { protect, adminOnly } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(adminOnly);

// Define AdminWallet model
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
  underscored: true,
  indexes: [
    { fields: ['wallet_type'] },
    { fields: ['is_active'] },
    { fields: ['created_at'] }
  ]
});

// Create table if it doesn't exist
AdminWallet.sync({ alter: true }).catch(err => {
  console.error('Error creating AdminWallet table:', err);
});

// @desc    Get all admin wallets
// @route   GET /api/admin/wallets
// @access  Private/Admin
const getAdminWallets = asyncHandler(async (req, res) => {
  try {
    const wallets = await AdminWallet.findAll({
      order: [['created_at', 'DESC']],
      attributes: ['id', 'walletType', 'walletAddress', 'qrCodeImage', 'isActive', 'description', 'networkType', 'createdAt']
    });

    logger.logAdminAction(req.user.id, 'ADMIN_WALLETS_VIEW', null, { count: wallets.length });

    res.status(200).json({
      success: true,
      data: wallets,
      count: wallets.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.logError('GET_ADMIN_WALLETS_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin wallets'
    });
  }
});

// @desc    Get active admin wallets (for user payments)
// @route   GET /api/admin/wallets/active
// @access  Private/Admin
const getActiveAdminWallets = asyncHandler(async (req, res) => {
  try {
    const wallets = await AdminWallet.findAll({
      where: { isActive: true },
      order: [['wallet_type', 'ASC']],
      attributes: ['id', 'walletType', 'walletAddress', 'qrCodeImage', 'description', 'networkType']
    });

    res.status(200).json({
      success: true,
      data: wallets,
      count: wallets.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.logError('GET_ACTIVE_ADMIN_WALLETS_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active admin wallets'
    });
  }
});

// @desc    Create new admin wallet
// @route   POST /api/admin/wallets
// @access  Private/Admin
const createAdminWallet = [
  // Validation
  body('walletType')
    .isIn(['USDT', 'BTC', 'ETH', 'BNB', 'LTC', 'DOGE'])
    .withMessage('Invalid wallet type'),
  body('walletAddress')
    .isLength({ min: 25, max: 255 })
    .withMessage('Wallet address must be between 25-255 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('networkType')
    .notEmpty()
    .withMessage('Network type is required'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    try {
      const { walletType, walletAddress, qrCodeImage, isActive = true, description, networkType } = req.body;

      // Check if wallet address already exists
      const existingWallet = await AdminWallet.findOne({
        where: { walletAddress: walletAddress.trim() }
      });

      if (existingWallet) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address already exists'
        });
      }

      const wallet = await AdminWallet.create({
        walletType,
        walletAddress: walletAddress.trim(),
        qrCodeImage: qrCodeImage || null,
        isActive,
        description: description.trim(),
        networkType,
        createdBy: req.user.id
      });

      logger.logAdminAction(req.user.id, 'ADMIN_WALLET_CREATED', null, {
        walletId: wallet.id,
        walletType,
        networkType
      });

      res.status(201).json({
        success: true,
        message: 'Admin wallet created successfully',
        data: wallet,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.logError('CREATE_ADMIN_WALLET_ERROR', error);
      res.status(500).json({
        success: false,
        message: 'Error creating admin wallet'
      });
    }
  })
];

// @desc    Update admin wallet
// @route   PUT /api/admin/wallets/:id
// @access  Private/Admin
const updateAdminWallet = [
  // Validation
  body('walletType')
    .optional()
    .isIn(['USDT', 'BTC', 'ETH', 'BNB', 'LTC', 'DOGE'])
    .withMessage('Invalid wallet type'),
  body('walletAddress')
    .optional()
    .isLength({ min: 25, max: 255 })
    .withMessage('Wallet address must be between 25-255 characters'),
  body('description')
    .optional()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    try {
      const { id } = req.params;
      const { walletType, walletAddress, qrCodeImage, isActive, description, networkType } = req.body;

      const wallet = await AdminWallet.findByPk(id);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // Check if wallet address already exists (excluding current wallet)
      if (walletAddress && walletAddress.trim() !== wallet.walletAddress) {
        const existingWallet = await AdminWallet.findOne({
          where: { 
            walletAddress: walletAddress.trim(),
            id: { [Op.ne]: id }
          }
        });

        if (existingWallet) {
          return res.status(400).json({
            success: false,
            message: 'Wallet address already exists'
          });
        }
      }

      // Update wallet
      await wallet.update({
        ...(walletType && { walletType }),
        ...(walletAddress && { walletAddress: walletAddress.trim() }),
        ...(qrCodeImage !== undefined && { qrCodeImage }),
        ...(isActive !== undefined && { isActive }),
        ...(description && { description: description.trim() }),
        ...(networkType && { networkType })
      });

      logger.logAdminAction(req.user.id, 'ADMIN_WALLET_UPDATED', null, {
        walletId: wallet.id,
        changes: req.body
      });

      res.status(200).json({
        success: true,
        message: 'Admin wallet updated successfully',
        data: wallet,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.logError('UPDATE_ADMIN_WALLET_ERROR', error);
      res.status(500).json({
        success: false,
        message: 'Error updating admin wallet'
      });
    }
  })
];

// @desc    Toggle admin wallet status
// @route   PUT /api/admin/wallets/:id/toggle
// @access  Private/Admin
const toggleAdminWalletStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const wallet = await AdminWallet.findByPk(id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    await wallet.update({ isActive });

    logger.logAdminAction(req.user.id, 'ADMIN_WALLET_STATUS_TOGGLED', null, {
      walletId: wallet.id,
      newStatus: isActive
    });

    res.status(200).json({
      success: true,
      message: `Wallet ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: wallet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.logError('TOGGLE_ADMIN_WALLET_STATUS_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error updating wallet status'
    });
  }
});

// @desc    Delete admin wallet
// @route   DELETE /api/admin/wallets/:id
// @access  Private/Admin
const deleteAdminWallet = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await AdminWallet.findByPk(id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    await wallet.destroy();

    logger.logAdminAction(req.user.id, 'ADMIN_WALLET_DELETED', null, {
      walletId: id,
      walletType: wallet.walletType,
      walletAddress: wallet.walletAddress
    });

    res.status(200).json({
      success: true,
      message: 'Admin wallet deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.logError('DELETE_ADMIN_WALLET_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin wallet'
    });
  }
});

// @desc    Get wallet by type for payments
// @route   GET /api/admin/wallets/type/:type
// @access  Private/Admin
const getWalletByType = asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;

    const wallet = await AdminWallet.findOne({
      where: { 
        walletType: type.toUpperCase(),
        isActive: true 
      },
      attributes: ['id', 'walletType', 'walletAddress', 'qrCodeImage', 'description', 'networkType']
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: `No active ${type.toUpperCase()} wallet found`
      });
    }

    res.status(200).json({
      success: true,
      data: wallet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.logError('GET_WALLET_BY_TYPE_ERROR', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet'
    });
  }
});

// Register routes
router.get('/', getAdminWallets);
router.get('/active', getActiveAdminWallets);
router.get('/type/:type', getWalletByType);
router.post('/', createAdminWallet);
router.put('/:id', updateAdminWallet);
router.put('/:id/toggle', toggleAdminWalletStatus);
router.delete('/:id', deleteAdminWallet);

module.exports = router;