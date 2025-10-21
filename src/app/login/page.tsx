'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle, Bitcoin, Mail, Lock } from 'lucide-react';
import { handleApiResponse } from '../../utils/errorHandler';
import VerificationPromptModal from '../../components/VerificationPromptModal';

// Custom CSS to force text visibility
const inputStyle = `
  .login-input {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .login-input:focus {
    color: #111827 !important;
    background-color: #ffffff !important;
    -webkit-text-fill-color: #111827 !important;
  }
  .login-input::-webkit-autofill,
  .login-input::-webkit-autofill:hover,
  .login-input::-webkit-autofill:focus,
  .login-input::-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
    color: #111827 !important;
  }
  
  /* Force link visibility */
  .login-link {
    color: #2563eb !important;
    text-decoration: none !important;
  }
  .login-link:hover {
    color: #1d4ed8 !important;
    text-decoration: none !important;
  }
  .login-link:visited {
    color: #2563eb !important;
  }
  .login-link:active {
    color: #1e40af !important;
  }
  
  /* Override any global link styles */
  a.login-link,
  a.login-link:hover,
  a.login-link:focus,
  a.login-link:active,
  a.login-link:visited {
    color: #2563eb !important;
    opacity: 1 !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
    -webkit-text-fill-color: #2563eb !important;
  }
  a.login-link:hover {
    color: #1d4ed8 !important;
    -webkit-text-fill-color: #1d4ed8 !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = inputStyle;
  document.head.appendChild(styleSheet);
}

// Set document title for user login
if (typeof window !== 'undefined') {
  document.title = 'User Login - BTCBOT24';
}

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  requiresVerification?: boolean;
  showVerificationPrompt?: boolean;
  data?: {
    token?: string;
    refreshToken?: string;
    email?: string;
    userId?: number;
    redirectTo?: string;
    user?: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

const LoginPage = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.push('/adminpanel/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
    setIsSuccess(false); // Clear success state when user types
    setShowVerificationModal(false); // Close modal when user types
  };

  const handleSendOTP = async () => {
    const response = await fetch('/api/auth/send-verification-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: unverifiedEmail }),
    });

    const result = await handleApiResponse(response);

    if (!result.success) {
      throw new Error(result.message);
    }

    // Redirect to OTP verification page after successful send
    const encodedEmail = encodeURIComponent(unverifiedEmail);
    setTimeout(() => {
      router.push(`${result.data?.redirectTo}?email=${encodedEmail}`);
    }, 1500);
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setUnverifiedEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await handleApiResponse(response);

      if (result.success && result.data && result.data.user) {
        const { user, token, refreshToken } = result.data;
        
        // Store tokens and user info
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(user));

        setIsLoggedIn(true);
        
        // Redirect based on role
        setTimeout(() => {
          if (user.role === 'admin' || user.role === 'superadmin') {
            router.push('/adminpanel/dashboard');
          } else {
            router.push('/dashboard');
          }
        }, 1000);

      } else if (result.requiresVerification && result.showVerificationPrompt) {
        // Show verification prompt modal
        setUnverifiedEmail(result.data?.email || '');
        setShowVerificationModal(true);
        setError('');
        setIsSuccess(false);
        
      } else {
        // Display the actual error message from server
        const errorMessage = result.message || 'Login failed. Please try again.';
        setError(errorMessage);
        setIsSuccess(false);
        console.error('Login failed:', result);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
          <div className="mt-4">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-6000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="flex flex-col justify-center items-center p-12 text-white w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-lg"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25">
                  <Bitcoin className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-lg"></div>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                BTCBOT24
              </h1>
              
              <p className="text-xl text-gray-200 mb-12 leading-relaxed">
                The future of cryptocurrency trading is here. Join thousands of traders who trust our advanced platform.
              </p>
              
              <div className="space-y-6 text-left">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Advanced Trading Tools</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Real-time Market Data</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">Secure & Reliable Platform</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Bitcoin className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-lg"></div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">BTCBOT24</h1>
            </div>

            {/* Form Container */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account to continue</p>
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700 font-medium">User Login</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      className="login-input w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                      placeholder="Enter your email address"
                      style={{ 
                        color: '#111827 !important',
                        backgroundColor: '#ffffff !important',
                        WebkitTextFillColor: '#111827 !important'
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative overflow-hidden rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                      className="login-input w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                      placeholder="Enter your password"
                      style={{ 
                        color: '#111827 !important',
                        backgroundColor: '#ffffff !important',
                        WebkitTextFillColor: '#111827 !important'
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-10">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error/Success Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center space-x-3 rounded-xl p-4 ${
                      isSuccess 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <Link 
                    href="/forgot-password" 
                    className="login-link text-sm font-medium transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 pt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      href="/register" 
                      className="login-link font-semibold transition-colors"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Verification Prompt Modal */}
      <VerificationPromptModal
        isOpen={showVerificationModal}
        onClose={handleCloseModal}
        email={unverifiedEmail}
        onSendOTP={handleSendOTP}
      />
    </div>
  );
};

export default LoginPage;