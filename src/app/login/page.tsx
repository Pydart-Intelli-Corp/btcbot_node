'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle, Bitcoin } from 'lucide-react';
import { handleApiResponse } from '../../utils/errorHandler';
import VerificationPromptModal from '../../components/VerificationPromptModal';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Successful!</h2>
          <p className="text-gray-300">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
          >
            <Bitcoin className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your BTCBOT24 account</p>
          <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
            <span className="text-sm text-blue-300">👤 User Login</span>
          </div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  style={{ 
                    WebkitTextSecurity: showPassword ? 'none' : 'disc',
                  } as React.CSSProperties}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all pr-12 [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-caps-lock-indicator]:hidden [&::-webkit-strong-password-auto-fill-button]:hidden [&::-ms-reveal]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error/Success Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center space-x-2 rounded-lg p-3 ${
                  isSuccess 
                    ? 'text-green-400 bg-green-400/10 border border-green-400/20' 
                    : 'text-red-400 bg-red-400/10 border border-red-400/20'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
            
            <div className="border-t border-white/20 pt-4 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <Link 
            href="/" 
            className="text-sm text-gray-400 hover:text-white transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          
          {/* Legal Links */}
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <Link 
              href="/terms-and-conditions" 
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link 
              href="/privacy-policy" 
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </motion.div>

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