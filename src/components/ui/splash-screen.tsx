'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show splash on first app load, not route changes
    const hasSeenSplash = sessionStorage.getItem('splash-shown');
    
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    // Mark splash as shown
    sessionStorage.setItem('splash-shown', 'true');
    
    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center px-4">
        {/* App Icon - Using same logo as navbar */}
        <div className="mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto bg-gray-900 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
        </div>

        {/* App Name */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 text-gray-900">
            Safety News
          </h1>
          <p className="text-gray-600 text-base sm:text-xl font-medium">
            Local Crime & Safety Information
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mt-8 sm:mt-10">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-3 sm:mt-4 text-gray-600 font-medium text-sm sm:text-base">
            Loading your safety dashboard...
          </p>
        </div>

        {/* Version Info */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs sm:text-sm font-medium">
          v1.0.0 • PWA Ready
        </div>

        {/* Minimal Decorative Elements */}
        <div className="hidden sm:block absolute top-10 left-10 w-1 h-1 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="hidden sm:block absolute top-20 right-16 w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="hidden sm:block absolute bottom-20 left-20 w-1 h-1 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
