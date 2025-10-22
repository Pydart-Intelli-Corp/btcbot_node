const { sequelize } = require('../config/database');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Affiliate = require('../models/Affiliate');

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
    },
    {
      name: 'Starter AI-Arbitrage',
      slug: 'starter-ai-arbitrage',
      description: 'Entry-level AI arbitrage bot perfect for newcomers to cryptocurrency trading.',
      price: 50.00,
      minInvestment: 25.00,
      maxInvestment: 500.00,
      durationValue: 15,
      durationUnit: 'days',
      dailyROI: 1.8,
      totalReturnLimit: 120.0,
      type: 'Basic',
      category: '30-Day',
      features: [
        { name: 'Basic Arbitrage Scanner', description: 'Monitors 15+ major exchanges for price differences', included: true },
        { name: 'Automated Trade Execution', description: 'Simple buy-low, sell-high automation', included: true },
        { name: 'Email Notifications', description: 'Daily profit reports via email', included: true },
        { name: 'Basic Risk Controls', description: 'Simple stop-loss and position limits', included: true }
      ],
      totalSubscribers: 1247,
      activeSubscribers: 892,
      createdBy: sampleUser.id
    },
    {
      name: 'Pro AI-Arbitrage',
      slug: 'pro-ai-arbitrage',
      description: 'Professional-grade arbitrage system with advanced AI algorithms and multi-market coverage.',
      price: 750.00,
      minInvestment: 500.00,
      maxInvestment: 10000.00,
      durationValue: 120,
      durationUnit: 'days',
      dailyROI: 4.2,
      totalReturnLimit: 350.0,
      type: 'Premium',
      category: '365-Day',
      features: [
        { name: 'Advanced Neural Networks', description: 'Deep learning algorithms for pattern recognition', included: true },
        { name: 'Cross-Chain Arbitrage', description: 'Exploits price differences across different blockchains', included: true },
        { name: 'Real-time Analytics Dashboard', description: 'Live performance tracking and insights', included: true },
        { name: 'Smart Risk Management', description: 'AI-powered position sizing and risk assessment', included: true },
        { name: 'Priority Trade Routes', description: 'Faster execution through premium exchange APIs', included: true }
      ],
      totalSubscribers: 658,
      activeSubscribers: 456,
      createdBy: sampleUser.id
    },
    {
      name: 'Quantum AI-Arbitrage',
      slug: 'quantum-ai-arbitrage',
      description: 'Next-generation quantum-enhanced AI for institutional-level arbitrage trading with maximum efficiency.',
      price: 2500.00,
      minInvestment: 2000.00,
      maxInvestment: 100000.00,
      durationValue: 180,
      durationUnit: 'days',
      dailyROI: 6.5,
      totalReturnLimit: 800.0,
      type: 'Elite',
      category: '365-Day',
      subscriptionFee: 150.00,
      requiresSubscription: true,
      isElite: true,
      features: [
        { name: 'Quantum Computing Integration', description: 'Quantum algorithms for ultra-fast market analysis', included: true },
        { name: 'Institutional Exchange Access', description: 'Direct access to professional trading platforms', included: true },
        { name: 'Predictive Market Modeling', description: 'AI predicts arbitrage opportunities before they appear', included: true },
        { name: 'White-Glove Service', description: 'Dedicated trading specialist and 24/7 concierge support', included: true },
        { name: 'Custom Strategy Development', description: 'Personalized AI trading strategies based on your goals', included: true },
        { name: 'Multi-Asset Arbitrage', description: 'Crypto, forex, and commodities arbitrage opportunities', included: true }
      ],
      totalSubscribers: 127,
      activeSubscribers: 94,
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