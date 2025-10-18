'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add deposit-specific fields to transactions table
      await queryInterface.addColumn('transactions', 'portfolio_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'portfolios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      await queryInterface.addColumn('transactions', 'investment_amount', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      }, { transaction });

      await queryInterface.addColumn('transactions', 'subscription_fee', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0
        }
      }, { transaction });

      await queryInterface.addColumn('transactions', 'platform_fee', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0
        }
      }, { transaction });

      await queryInterface.addColumn('transactions', 'payment_method', {
        type: Sequelize.ENUM('USDT', 'BTC', 'ETH', 'BNB'),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('transactions', 'transaction_hash', {
        type: Sequelize.STRING(100),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('transactions', 'proof_image', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('transactions', 'rejected_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      await queryInterface.addColumn('transactions', 'rejected_at', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('transactions', 'rejection_reason', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('transactions', 'admin_notes', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('transactions', 'last_modified_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      await queryInterface.addColumn('transactions', 'last_modified_at', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      // Add indexes for better performance
      await queryInterface.addIndex('transactions', ['portfolio_id'], {
        name: 'transactions_portfolio_id_idx',
        transaction
      });

      await queryInterface.addIndex('transactions', ['payment_method'], {
        name: 'transactions_payment_method_idx',
        transaction
      });

      await queryInterface.addIndex('transactions', ['transaction_hash'], {
        name: 'transactions_hash_idx',
        transaction
      });

      await queryInterface.addIndex('transactions', ['rejected_by'], {
        name: 'transactions_rejected_by_idx',
        transaction
      });

      await queryInterface.addIndex('transactions', ['last_modified_by'], {
        name: 'transactions_last_modified_by_idx',
        transaction
      });

      await transaction.commit();
      console.log('✅ Successfully added deposit-specific fields to transactions table');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding deposit fields to transactions table:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove indexes first
      await queryInterface.removeIndex('transactions', 'transactions_portfolio_id_idx', { transaction });
      await queryInterface.removeIndex('transactions', 'transactions_payment_method_idx', { transaction });
      await queryInterface.removeIndex('transactions', 'transactions_hash_idx', { transaction });
      await queryInterface.removeIndex('transactions', 'transactions_rejected_by_idx', { transaction });
      await queryInterface.removeIndex('transactions', 'transactions_last_modified_by_idx', { transaction });

      // Remove columns
      await queryInterface.removeColumn('transactions', 'portfolio_id', { transaction });
      await queryInterface.removeColumn('transactions', 'investment_amount', { transaction });
      await queryInterface.removeColumn('transactions', 'subscription_fee', { transaction });
      await queryInterface.removeColumn('transactions', 'platform_fee', { transaction });
      await queryInterface.removeColumn('transactions', 'payment_method', { transaction });
      await queryInterface.removeColumn('transactions', 'transaction_hash', { transaction });
      await queryInterface.removeColumn('transactions', 'proof_image', { transaction });
      await queryInterface.removeColumn('transactions', 'rejected_by', { transaction });
      await queryInterface.removeColumn('transactions', 'rejected_at', { transaction });
      await queryInterface.removeColumn('transactions', 'rejection_reason', { transaction });
      await queryInterface.removeColumn('transactions', 'admin_notes', { transaction });
      await queryInterface.removeColumn('transactions', 'last_modified_by', { transaction });
      await queryInterface.removeColumn('transactions', 'last_modified_at', { transaction });

      await transaction.commit();
      console.log('✅ Successfully removed deposit-specific fields from transactions table');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing deposit fields from transactions table:', error.message);
      throw error;
    }
  }
};