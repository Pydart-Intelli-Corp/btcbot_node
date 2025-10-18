'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type: {
        type: Sequelize.ENUM('deposit', 'withdrawal', 'commission', 'earning', 'bonus', 'penalty', 'refund'),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('manual', 'automatic', 'bot', 'referral', 'admin'),
        defaultValue: 'manual'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.ENUM('USD', 'USDT', 'BTC', 'ETH', 'BNB'),
        defaultValue: 'USD'
      },
      exchange_rate: {
        type: Sequelize.DECIMAL(10, 6),
        defaultValue: 1.000000
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected'),
        defaultValue: 'pending'
      },
      deposit_info: {
        type: Sequelize.JSON,
        allowNull: true
      },
      withdrawal_info: {
        type: Sequelize.JSON,
        allowNull: true
      },
      referral_info: {
        type: Sequelize.JSON,
        allowNull: true
      },
      bot_info: {
        type: Sequelize.JSON,
        allowNull: true
      },
      processed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      internal_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      balance_before: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      balance_after: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      initiated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_error: {
        type: Sequelize.JSON,
        allowNull: true
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
    await queryInterface.addIndex('transactions', ['user_id', 'created_at']);
    await queryInterface.addIndex('transactions', ['transaction_id']);
    await queryInterface.addIndex('transactions', ['type', 'status']);
    await queryInterface.addIndex('transactions', ['status', 'created_at']);
    await queryInterface.addIndex('transactions', ['processed_by']);
    await queryInterface.addIndex('transactions', ['initiated_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};