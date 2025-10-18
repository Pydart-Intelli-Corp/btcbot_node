const { Portfolio } = require('./models');
const logger = require('./utils/logger');

async function seedPortfolios() {
  try {
    console.log('🌱 Seeding portfolios...');

    // Check if portfolios already exist
    const existingPortfolios = await Portfolio.count();
    if (existingPortfolios > 0) {
      console.log('✓ Portfolios already exist. Skipping seed.');
      return;
    }

    // Create default portfolios
    const portfolios = [
      {
        name: 'Starter Plan',
        description: 'Perfect for beginners looking to start their crypto trading journey',
        minimumDeposit: 100,
        maximumDeposit: 999,
        dailyROI: 2.5,
        duration: 30,
        features: [
          'Daily ROI: 2.5%',
          'Duration: 30 days',
          'Minimum deposit: $100',
          'Maximum deposit: $999',
          'Basic trading strategies',
          'Email support'
        ],
        category: 'Basic',
        riskLevel: 'Low',
        isActive: true,
        createdBy: 1, // Admin user
        lastModifiedBy: 1
      },
      {
        name: 'Growth Plan',
        description: 'Ideal for investors seeking moderate returns with balanced risk',
        minimumDeposit: 1000,
        maximumDeposit: 4999,
        dailyROI: 3.0,
        duration: 60,
        features: [
          'Daily ROI: 3.0%',
          'Duration: 60 days',
          'Minimum deposit: $1,000',
          'Maximum deposit: $4,999',
          'Advanced trading algorithms',
          'Priority support',
          'Weekly performance reports'
        ],
        category: 'Intermediate',
        riskLevel: 'Medium',
        isActive: true,
        createdBy: 1,
        lastModifiedBy: 1
      },
      {
        name: 'Professional Plan',
        description: 'Designed for serious traders wanting maximum returns',
        minimumDeposit: 5000,
        maximumDeposit: 19999,
        dailyROI: 3.5,
        duration: 90,
        features: [
          'Daily ROI: 3.5%',
          'Duration: 90 days',
          'Minimum deposit: $5,000',
          'Maximum deposit: $19,999',
          'Professional trading strategies',
          'Dedicated account manager',
          'Daily performance reports',
          'Advanced analytics dashboard'
        ],
        category: 'Advanced',
        riskLevel: 'Medium-High',
        isActive: true,
        createdBy: 1,
        lastModifiedBy: 1
      },
      {
        name: 'Elite Plan',
        description: 'Premium plan for high-net-worth individuals and institutional investors',
        minimumDeposit: 20000,
        maximumDeposit: 99999,
        dailyROI: 4.0,
        duration: 120,
        features: [
          'Daily ROI: 4.0%',
          'Duration: 120 days',
          'Minimum deposit: $20,000',
          'Maximum deposit: $99,999',
          'Elite trading strategies',
          'Personal trading consultant',
          'Real-time performance tracking',
          'Custom risk management',
          'VIP support line'
        ],
        category: 'Premium',
        riskLevel: 'High',
        isActive: true,
        createdBy: 1,
        lastModifiedBy: 1
      },
      {
        name: 'Institutional Plan',
        description: 'Exclusive plan for institutional investors and ultra-high-net-worth individuals',
        minimumDeposit: 100000,
        maximumDeposit: 1000000,
        dailyROI: 4.5,
        duration: 180,
        features: [
          'Daily ROI: 4.5%',
          'Duration: 180 days',
          'Minimum deposit: $100,000',
          'Maximum deposit: $1,000,000',
          'Institutional-grade strategies',
          'Dedicated portfolio manager',
          'Custom reporting suite',
          'Direct API access',
          'Institutional support team',
          'Quarterly strategy reviews'
        ],
        category: 'Institutional',
        riskLevel: 'High',
        isActive: true,
        createdBy: 1,
        lastModifiedBy: 1
      }
    ];

    // Insert portfolios
    for (const portfolioData of portfolios) {
      await Portfolio.create(portfolioData);
      console.log(`✓ Created portfolio: ${portfolioData.name}`);
    }

    console.log('🎉 Portfolio seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding portfolios:', error);
    logger.logError('PORTFOLIO_SEED_ERROR', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedPortfolios().then(() => {
    console.log('Portfolio seeding process completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Portfolio seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { seedPortfolios };