'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('affiliates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      referral_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      referral_link: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      total_referrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      active_referrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      direct_referrals: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      level_counts: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"level1": 0, "level2": 0, "level3": 0, "level4": 0, "level5": 0, "level6": 0, "level7": 0, "level8": 0, "level9": 0, "level10": 0, "level11": 0, "level12": 0, "level13": 0, "level14": 0, "level15": 0}'
      },
      total_commissions: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      available_commissions: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      withdrawn_commissions: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      pending_commissions: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      level_earnings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"level1": 0, "level2": 0, "level3": 0, "level4": 0, "level5": 0, "level6": 0, "level7": 0, "level8": 0, "level9": 0, "level10": 0, "level11": 0, "level12": 0, "level13": 0, "level14": 0, "level15": 0}'
      },
      team_stats: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"totalTeamSize": 0, "activeTeamMembers": 0, "totalTeamVolume": 0, "teamEarnings": 0}'
      },
      performance_metrics: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"conversionRate": 0, "averageInvestment": 0, "topPerformerLevel": 1, "monthlyGrowthRate": 0, "retentionRate": 0}'
      },
      click_stats: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"totalClicks": 0, "uniqueClicks": 0, "todayClicks": 0, "thisWeekClicks": 0, "thisMonthClicks": 0, "lastClickAt": null}'
      },
      commission_settings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"customRates": {"level1": null, "level2": null, "level3": null, "level4": null, "level5": null, "level6": null, "level7": null, "level8": null, "level9": null, "level10": null, "level11": null, "level12": null, "level13": null, "level14": null, "level15": null}, "bonusMultiplier": 1, "specialBonus": 0}'
      },
      achievements: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      marketing_tools: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"customBanners": [], "emailTemplates": [], "socialMediaLinks": {"facebook": "", "twitter": "", "instagram": "", "telegram": "", "whatsapp": ""}}'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_premium_affiliate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tier: {
        type: Sequelize.ENUM('Bronze', 'Silver', 'Gold', 'Diamond'),
        defaultValue: 'Bronze'
      },
      payout_settings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"minimumPayout": 50, "payoutMethod": "wallet", "autoPayoutEnabled": false, "payoutSchedule": "manual"}'
      },
      first_referral_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_commission_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tier_updated_at: {
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
    await queryInterface.addIndex('affiliates', ['user_id']);
    await queryInterface.addIndex('affiliates', ['referral_code']);
    await queryInterface.addIndex('affiliates', ['tier']);
    await queryInterface.addIndex('affiliates', ['is_active']);
    await queryInterface.addIndex('affiliates', ['total_commissions']);
    await queryInterface.addIndex('affiliates', ['total_referrals']);
    await queryInterface.addIndex('affiliates', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('affiliates');
  }
};