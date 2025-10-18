const { sequelize } = require('./config/database');
const User = require('./models/User');
const Portfolio = require('./models/Portfolio');
const Transaction = require('./models/Transaction');
const Affiliate = require('./models/Affiliate');

async function runMigrations() {
  try {
    console.log('Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');
    
    // Sync all models (this will create tables if they don't exist)
    console.log('Creating database tables...');
    
    // Create tables in the correct order (respecting foreign keys)
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✓ Database tables created successfully.');
    
    // Create some sample portfolios if none exist
    const portfolioCount = await Portfolio.count();
    if (portfolioCount === 0) {
      console.log('Creating sample portfolios...');
      await createSamplePortfolios();
      console.log('✓ Sample portfolios created.');
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function createSamplePortfolios() {
  const sampleUser = await User.create({
    email: 'admin@btcbot24.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    referralCode: 'BTCADMIN001',
    isEmailVerified: true,
    isProfileComplete: true
  });

  const portfolios = [
    {
      name: 'Basic Trader Bot',
      slug: 'basic-trader-bot',
      description: 'Perfect for beginners. Start your trading journey with our basic bot.',
      price: 100.00,
      minInvestment: 50.00,
      maxInvestment: 1000.00,
      durationValue: 30,
      durationUnit: 'days',
      dailyROI: 2.5,
      totalReturnLimit: 150.0,
      type: 'Basic',
      category: '30-Day',
      features: [
        { name: 'Basic Trading Algorithm', description: 'Simple but effective trading strategies', included: true },
        { name: '24/7 Trading', description: 'Round the clock automated trading', included: true },
        { name: 'Basic Support', description: 'Email support during business hours', included: true }
      ],
      createdBy: sampleUser.id
    },
    {
      name: 'Premium Trader Bot',
      slug: 'premium-trader-bot',
      description: 'Advanced features for serious traders. Higher returns with smart algorithms.',
      price: 500.00,
      minInvestment: 200.00,
      maxInvestment: 5000.00,
      durationValue: 90,
      durationUnit: 'days',
      dailyROI: 3.5,
      totalReturnLimit: 250.0,
      type: 'Premium',
      category: '365-Day',
      features: [
        { name: 'Advanced AI Trading', description: 'Machine learning powered trading algorithms', included: true },
        { name: 'Multi-Pair Trading', description: 'Trade across multiple cryptocurrency pairs', included: true },
        { name: 'Priority Support', description: '24/7 priority customer support', included: true },
        { name: 'Risk Management', description: 'Advanced risk management tools', included: true }
      ],
      createdBy: sampleUser.id
    },
    {
      name: 'Elite Trader Bot',
      slug: 'elite-trader-bot',
      description: 'Professional grade trading bot with maximum returns and exclusive features.',
      price: 1000.00,
      minInvestment: 1000.00,
      maxInvestment: 50000.00,
      durationValue: 365,
      durationUnit: 'days',
      dailyROI: 5.0,
      totalReturnLimit: 500.0,
      type: 'Elite',
      category: '365-Day',
      subscriptionFee: 50.00,
      requiresSubscription: true,
      isElite: true,
      features: [
        { name: 'Elite AI Trading Engine', description: 'Most advanced AI-powered trading system', included: true },
        { name: 'Institutional Grade Security', description: 'Bank-level security for your investments', included: true },
        { name: 'Personal Account Manager', description: 'Dedicated personal account manager', included: true },
        { name: 'Custom Strategy Building', description: 'Build and customize your own trading strategies', included: true },
        { name: 'Advanced Analytics', description: 'Comprehensive performance analytics and reporting', included: true }
      ],
      createdBy: sampleUser.id
    }
  ];

  for (const portfolioData of portfolios) {
    await Portfolio.create(portfolioData);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };