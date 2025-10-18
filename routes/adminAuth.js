const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { 
  asyncHandler, 
  validationError, 
  authError
} = require('../middleware/errorHandler');
const { sendTokenResponse } = require('../middleware/auth');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

const router = express.Router();

// Admin login validation
const adminLoginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(validationError(errors.array()[0].msg));
  }

  const { email, password } = req.body;

  // Normalize email to lowercase for consistent lookup
  const normalizedEmail = email.toLowerCase().trim();

  // Check for user and include password
  const user = await User.findOne({ 
    where: { email: normalizedEmail },
    attributes: { include: ['password'] }
  });

  if (!user) {
    logger.logAuthAttempt(normalizedEmail, false, req.ip, req.get('User-Agent'));
    return sendErrorResponse(res, 'Invalid admin credentials', 401);
  }

  // Check if user is an admin
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    logger.logSecurityEvent(
      'NON_ADMIN_LOGIN_ATTEMPT',
      'Non-admin user attempted admin login',
      user.id,
      req.ip,
      req.get('User-Agent')
    );
    return sendErrorResponse(res, 'Access denied. Admin privileges required.', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    logger.logSecurityEvent(
      'INACTIVE_ADMIN_LOGIN_ATTEMPT',
      'Inactive admin attempted login',
      user.id,
      req.ip,
      req.get('User-Agent')
    );
    return sendErrorResponse(res, 'Admin account has been deactivated. Contact support for assistance.', 401);
  }

  // Check if account is locked
  if (user.getIsLocked && user.getIsLocked()) {
    logger.logSecurityEvent(
      'LOCKED_ADMIN_LOGIN_ATTEMPT',
      'Locked admin attempted login',
      user.id,
      req.ip,
      req.get('User-Agent')
    );
    return sendErrorResponse(res, 'Admin account is temporarily locked due to multiple failed login attempts.', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    logger.logAuthAttempt(email, false, req.ip, req.get('User-Agent'));
    logger.logSecurityEvent(
      'FAILED_ADMIN_LOGIN_ATTEMPT',
      'Invalid password provided for admin login',
      user.id,
      req.ip,
      req.get('User-Agent')
    );
    
    return sendErrorResponse(res, 'Invalid admin credentials', 401);
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Log successful admin login
  logger.logUserAction(user.id, 'ADMIN_LOGIN', {
    loginTime: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.logSecurityEvent(
    'ADMIN_LOGIN_SUCCESS',
    'Admin user logged in successfully',
    user.id,
    req.ip,
    req.get('User-Agent')
  );

  sendTokenResponse(user, 200, res, 'Admin login successful', req);
});

// @desc    Get current logged in admin
// @route   GET /api/admin/me
// @access  Private (Admin only)
const getAdminMe = asyncHandler(async (req, res, next) => {
  // This will be protected by adminOnly middleware
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    return sendErrorResponse(res, 'Admin user not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        currentRank: user.currentRank,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Register routes
router.post('/login', adminLoginValidation, adminLogin);

module.exports = router;