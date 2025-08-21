'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/auth/auth-store';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { userProfile, loading } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
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

  // Don't render user-specific content until client-side hydration is complete
  if (!isClient || loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Safety News
                </h1>
              </Link>
              <div className="hidden sm:flex space-x-4 sm:space-x-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/search" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Search
                </Link>
                <Link href="/dashboard/map" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Map
                </Link>
                <Link href="/dashboard/profile" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Profile
                </Link>
              </div>
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

              {/* Loading state for user info */}
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
                <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>

              {/* Mobile loading state */}
              <div className="sm:hidden flex items-center space-x-2">
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200 bg-white`}>
            <div className="px-3 py-4 space-y-2">
              <Link href="/dashboard" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/search" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                Search
              </Link>
              <Link href="/dashboard/map" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                Map
              </Link>
              <Link href="/dashboard/profile" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Safety News
              </h1>
            </Link>
            <div className="hidden sm:flex space-x-4 sm:space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/search" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Search
              </Link>
              <Link href="/dashboard/map" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Map
              </Link>
              <Link href="/dashboard/profile" className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Profile
              </Link>
            </div>
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
              {userProfile ? (
                <>
                  <Link 
                    href="/dashboard/profile" 
                    className="text-right hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile.full_name || userProfile.email}
                    </p>
                  </Link>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs sm:text-sm border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-200"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    className="text-xs sm:text-sm border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-200"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center space-x-2">
              {userProfile ? (
                <>
                  <Link 
                    href="/dashboard/profile" 
                    className="text-right hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile.full_name || userProfile.email}
                    </p>
                  </Link>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200 bg-white`}>
          <div className="px-3 py-4 space-y-2">
            <Link href="/dashboard" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/search" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
              Search
            </Link>
            <Link href="/dashboard/map" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
              Map
            </Link>
            <Link href="/dashboard/profile" className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}