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
  const noHeaderRoutes = ['/login', '/register', '/adminpanel'];
  
  // Admin routes that handle their own layout
  const adminRoutes = ['/adminpanel'];
  
  // Routes that should show splash screen (only home page)
  const splashRoutes = ['/'];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
  
  // Check if current route should not show header
  const shouldShowNoHeader = noHeaderRoutes.some(route => pathname?.startsWith(route));
  
  // Check if current route is admin route
  const isAdminRoute = adminRoutes.some(route => pathname?.startsWith(route));
  
  // Check if current route should show splash
  const shouldShowSplash = splashRoutes.includes(pathname || '/');

  useEffect(() => {
    setIsClient(true);
    
    // Check authentication status
    const token = localStorage.getItem('authToken');
    const adminToken = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('userData');
    
    console.log('ClientWrapper - Auth check:', {
      token: !!token,
      adminToken: !!adminToken,
      userData: !!userData,
      pathname,
      isProtectedRoute,
      isAdminRoute
    });
    
    // For admin routes, check admin token; for user routes, check user token
    if (isAdminRoute) {
      setIsAuthenticated(!!adminToken);
    } else {
      setIsAuthenticated(!!token);
    }
    
    // Only show splash on home page and if it hasn't been shown in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (shouldShowSplash && !hasSeenSplash) {
      setShowSplash(true);
    }
  }, [shouldShowSplash, pathname, isProtectedRoute, isAdminRoute]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  // Determine which header to show
  const renderHeader = () => {
    if (shouldShowNoHeader || isAdminRoute) {
      console.log('ClientWrapper - No header for route:', pathname, { shouldShowNoHeader, isAdminRoute });
      return null;
    }
    
    const shouldShowUserHeader = isAuthenticated || isProtectedRoute;
    console.log('ClientWrapper - Header decision:', {
      shouldShowUserHeader,
      isAuthenticated,
      isProtectedRoute,
      isAdminRoute,
      pathname
    });
    
    if (shouldShowUserHeader) {
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