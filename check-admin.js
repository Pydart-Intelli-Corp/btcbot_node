const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  try {
    console.log('Checking for existing users...');
    
    // Check if any users exist
    const users = await User.findAll({ 
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive'],
      order: [['created_at', 'ASC']]
    });
    
    console.log(`Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.firstName} ${user.lastName}, Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    // Check if admin exists
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminUser) {
      console.log('\nNo admin user found. Creating default admin...');
      
      // Generate referral code
      const referralCode = 'ADMIN' + Date.now().toString().slice(-6);
      
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await User.create({
        email: 'admin@btcbot24.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isProfileComplete: true,
        referralCode: referralCode,
        walletBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalEarnings: 0,
        totalCommissions: 0,
        directReferrals: 0,
        totalReferrals: 0,
        currentRank: 'Bronze',
        subscriptionStatus: 'inactive'
      });
      
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: admin@btcbot24.com`);
      console.log(`   Password: admin123`);
      console.log(`   Referral Code: ${referralCode}`);
    } else {
      console.log(`\n✅ Admin user already exists: ${adminUser.email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndCreateAdmin();