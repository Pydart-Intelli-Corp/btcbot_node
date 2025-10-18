'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from './SplashScreen';
import Header from './Header';
import UserHeader from './UserHeader';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper = ({ children }: ClientWrapperProps) => {
  const [showSplash, setShowSplash] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  // Routes that require authentication
  const protectedRoutes = ['/dashboard', '/plans', '/transactions', '/referrals', '/profile', '/admin'];
  
  // Routes that should not show any header
  const noHeaderRoutes = ['/login', '/register'];
  
  // Routes that should show splash screen (only home page)
  const splashRoutes = ['/'];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
  
  // Check if current route should not show header
  const shouldShowNoHeader = noHeaderRoutes.some(route => pathname?.startsWith(route));
  
  // Check if current route should show splash
  const shouldShowSplash = splashRoutes.includes(pathname || '/');

  useEffect(() => {
    setIsClient(true);
    
    // Check authentication status
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    
    // Only show splash on home page and if it hasn't been shown in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (shouldShowSplash && !hasSeenSplash) {
      setShowSplash(true);
    }
  }, [shouldShowSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  // Determine which header to show
  const renderHeader = () => {
    if (shouldShowNoHeader) return null;
    
    if (isAuthenticated || isProtectedRoute) {
      return <UserHeader />;
    }
    
    return <Header />;
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {renderHeader()}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientWrapper;