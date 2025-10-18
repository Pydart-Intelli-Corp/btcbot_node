'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('portfolios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(150),
        unique: true,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      min_investment: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      max_investment: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      duration_value: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      duration_unit: {
        type: Sequelize.ENUM('days', 'months', 'years'),
        allowNull: false,
        defaultValue: 'days'
      },
      daily_roi: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      total_return_limit: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      features: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      type: {
        type: Sequelize.ENUM('Basic', 'Premium', 'Elite'),
        allowNull: false,
        defaultValue: 'Basic'
      },
      category: {
        type: Sequelize.ENUM('30-Day', '365-Day', 'Custom'),
        allowNull: false
      },
      subscription_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      requires_subscription: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_elite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      available_slots: {
        type: Sequelize.INTEGER,
        defaultValue: -1
      },
      used_slots: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      bot_settings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"autoActivation": true, "activationDelay": 24, "tradingPairs": [], "riskLevel": "Medium"}'
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      background_color: {
        type: Sequelize.STRING(7),
        defaultValue: '#ffffff'
      },
      text_color: {
        type: Sequelize.STRING(7),
        defaultValue: '#000000'
      },
      gradient_color_from: {
        type: Sequelize.STRING(7),
        defaultValue: '#3b82f6'
      },
      gradient_color_to: {
        type: Sequelize.STRING(7),
        defaultValue: '#8b5cf6'
      },
      total_subscribers: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      active_subscribers: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_volume: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0.00
      },
      total_returns: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0.00
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      meta: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"title": "", "description": "", "keywords": []}'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      last_modified_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('portfolios', ['slug']);
    await queryInterface.addIndex('portfolios', ['type']);
    await queryInterface.addIndex('portfolios', ['category']);
    await queryInterface.addIndex('portfolios', ['is_active', 'is_visible']);
    await queryInterface.addIndex('portfolios', ['display_order']);
    await queryInterface.addIndex('portfolios', ['price']);
    await queryInterface.addIndex('portfolios', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('portfolios');
  }
};