'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      wallet_address: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      wallet_qr_code: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_profile_complete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'superadmin'),
        defaultValue: 'user'
      },
      referral_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      referred_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      referral_level: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_referrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      direct_referrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      wallet_balance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      total_deposited: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      total_withdrawn: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      total_earnings: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      total_commissions: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      current_rank: {
        type: Sequelize.ENUM('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'),
        defaultValue: 'Bronze'
      },
      rank_updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      active_subscription: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'portfolios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      subscription_status: {
        type: Sequelize.ENUM('none', 'pending', 'active', 'expired', 'cancelled'),
        defaultValue: 'none'
      },
      subscription_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      subscription_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      bot_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      bot_activated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      daily_roi: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      email_verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email_verification_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lock_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_activity: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['referral_code']);
    await queryInterface.addIndex('users', ['referred_by']);
    await queryInterface.addIndex('users', ['current_rank']);
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};