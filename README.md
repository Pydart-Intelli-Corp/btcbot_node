# BTCBOT24 Backend API

# BTCBOT24 Backend - MySQL Version

A comprehensive Node.js backend API server for a cryptocurrency trading platform with referral-based subscription system, now using MySQL database with Sequelize ORM.

## Features

- **User Authentication**: Registration, login, JWT tokens, password reset
- **Referral System**: 15-level multi-level marketing structure with commission distribution
- **Portfolio Management**: Investment plans with different tiers (Basic, Premium, Elite)
- **Deposit System**: Manual deposit approval with file upload for payment proofs
- **Withdrawal System**: Admin-approved withdrawal requests with multiple payment methods
- **Rank Management**: Automatic rank assignment based on deposits and referrals
- **Admin Dashboard**: Complete admin panel for managing users, deposits, withdrawals
- **Bot Management**: Automated trading bot activation and earnings simulation
- **Transaction History**: Comprehensive transaction logging and reporting
- **Security**: Rate limiting, input validation, secure headers, logging

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator, Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer (configured but not implemented)

## Directory Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers (to be implemented)
├── middleware/       # Custom middleware
│   ├── auth.js      # Authentication middleware
│   └── errorHandler.js # Error handling middleware
├── models/          # Database models
│   ├── User.js      # User model with referral system
│   ├── Portfolio.js # Investment portfolio model
│   ├── Transaction.js # Transaction model
│   └── Affiliate.js # Affiliate tracking model
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── user.js      # User management routes
│   ├── portfolio.js # Portfolio routes
│   ├── transaction.js # Transaction routes
│   ├── affiliate.js # Affiliate routes
│   └── admin.js     # Admin routes
├── utils/           # Utility functions
│   └── logger.js    # Logging utility
├── uploads/         # File upload directory
├── logs/           # Log files directory
├── .env.example    # Environment variables template
├── .gitignore      # Git ignore rules
├── package.json    # Dependencies and scripts
└── server.js       # Main server file
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 2. Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your .env file:**
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   HOST=localhost

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/btcbot24

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d

   # Admin Configuration
   ADMIN_EMAIL=admin@btcbot24.com
   ADMIN_PASSWORD=AdminPassword123!

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

### 3. Database Setup

1. **Start MongoDB:**
   - Local: Start your MongoDB service
   - Cloud: Use MongoDB Atlas connection string

2. **Database will be created automatically** when you first start the server

### 4. Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### 5. API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/change-password` - Change password

#### Health Check
- `GET /health` - Server health status
- `GET /api` - API information

## Models Overview

### User Model
- Basic user information (email, password, name, phone)
- Wallet information (address, QR code)
- Referral system (referral code, referrer, level)
- Financial data (balance, deposits, withdrawals, earnings)
- Rank system (Bronze, Silver, Gold, Platinum, Diamond)
- Bot settings and subscription status

### Portfolio Model
- Investment plans (Basic, Premium, Elite packages)
- Pricing and duration information
- Daily ROI and return limits
- Features and benefits
- Bot configuration
- Subscription management

### Transaction Model
- All financial transactions (deposits, withdrawals, commissions)
- Payment proofs and verification
- Status tracking and approval workflow
- Commission distribution tracking
- Bot earnings recording

### Affiliate Model
- Referral tracking and statistics
- 15-level commission structure
- Team performance metrics
- Marketing tools and resources
- Tier management (Bronze, Silver, Gold, Diamond)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for API endpoints
- Input validation and sanitization
- Secure HTTP headers with Helmet
- CORS configuration
- Request logging and monitoring
- Account lockout after failed attempts
- IP-based security tracking

## Commission Structure

Default 15-level commission rates:
- Level 1: 5.0%
- Levels 2-5: 2.0%
- Levels 6-10: 1.0%
- Levels 11-15: 0.5%

## Rank System

Automatic rank assignment based on total deposits:
- **Bronze**: $0 - $999
- **Silver**: $1,000 - $4,999
- **Gold**: $5,000 - $24,999
- **Platinum**: $25,000 - $99,999
- **Diamond**: $100,000+

## Next Steps

1. **Implement remaining route handlers** for user, portfolio, transaction, affiliate, and admin modules
2. **Set up email service** for notifications and password reset
3. **Implement file upload handling** for payment proofs
4. **Add more comprehensive validation** and error handling
5. **Set up automated testing** with Jest and Supertest
6. **Configure production deployment** with PM2 or Docker
7. **Add API documentation** with Swagger/OpenAPI
8. **Implement real-time features** with Socket.io if needed

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Support

For support and questions:
- Email: support@btcbot24.com
- Documentation: https://docs.btcbot24.com (when available)

## License

MIT License - see LICENSE file for details.