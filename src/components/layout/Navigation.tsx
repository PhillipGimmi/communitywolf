'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/auth/auth-store';

// Import the UserProfile type to avoid duplication
type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  country_id: string;
  verified: boolean;
  phone_number?: string | null;
  last_seen_at?: string | null;
  preferences: string | number | boolean | null | { [key: string]: unknown } | unknown[];
  created_at: string;
  updated_at: string;
  role?: {
    name?: string;
    level?: number;
    description?: string;
  };
  country?: {
    name?: string;
    code?: string;
  };
};

// Shared navigation structure component to eliminate duplication
function NavigationStructure({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  userProfile, 
  handleSignOut 
}: Readonly<{
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  userProfile: UserProfile | null;
  handleSignOut: () => void;
}>) {
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' }
  ];

  const renderNavLinks = (isMobile: boolean = false) => (
    <div className={`${isMobile ? 'block' : 'hidden sm:flex'} ${isMobile ? 'px-3 py-4 space-y-2' : 'space-x-4 sm:space-x-6'}`}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${isMobile ? 'block' : ''} text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  const renderUserInfo = (isMobile: boolean = false) => {
    if (userProfile) {
      return (
        <>
          <Link href="/dashboard/profile" className="text-right hover:opacity-80 transition-opacity cursor-pointer">
            <p className="text-sm font-medium text-gray-900">
              {userProfile.full_name || userProfile.email}
            </p>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className={`text-xs ${isMobile ? '' : 'sm:text-sm'} border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? '' : 'hover:scale-105 transition-all duration-200'}`}
          >
            Sign Out
          </Button>
        </>
      );
    } else {
      return (
        <Link href="/auth/login">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`text-xs ${isMobile ? '' : 'sm:text-sm'} border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? '' : 'hover:scale-105 transition-all duration-200'}`}
          >
            Sign In
          </Button>
        </Link>
      );
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Safety News</h1>
            </Link>
            {renderNavLinks(false)}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
            
            {/* Desktop User Info */}
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
              {renderUserInfo(false)}
            </div>
            
            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center space-x-2">
              {renderUserInfo(true)}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200 bg-white`}>
          {renderNavLinks(true)}
        </div>
      </div>
    </nav>
  );
}

export function Navigation() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile, loading, initialized } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignOut() {
    try {
      console.log('🔧 Navigation: Sign out button clicked');
      // Force clear all auth data immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all Supabase cookies
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Clear auth store state
      useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        userProfile: null,
        loading: false,
        subscription: null
      });
      
      console.log('✅ Navigation: All auth data cleared, redirecting to login...');
      // Force redirect to login
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('❌ Navigation: Sign out failed:', error);
      // Even if there's an error, force redirect
      window.location.href = '/auth/login';
    }
  }

  // Return null on server and during initial render to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading skeleton until auth is initialized
  if (!initialized || loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Safety News</h1>
              </Link>
              <div className="hidden sm:flex space-x-4 sm:space-x-6">
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Menu Button */}
              <div className="sm:hidden">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
              {/* Loading state for user info */}
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
                <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
              {/* Mobile loading state */}
              <div className="sm:hidden flex items-center space-x-2">
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
          {/* Mobile Menu */}
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-3 py-4 space-y-2">
              <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <NavigationStructure
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      userProfile={userProfile}
      handleSignOut={handleSignOut}
    />
  );
}