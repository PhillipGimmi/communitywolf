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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center z-50">
      <div className="text-center px-6 max-w-md mx-auto">
        {/* App Icon - Enhanced with better styling */}
        <div className="mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-all duration-500 hover:shadow-3xl">
            <Shield className="w-14 h-14 sm:w-20 sm:h-20 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* App Name - Enhanced typography */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-gray-900 tracking-tight">
            Safety News
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl font-medium leading-relaxed">
            Your Guardian in an Uncertain World
          </p>
        </div>

        {/* Enhanced Loading Animation */}
        <div className="mt-10">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto shadow-lg"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium text-base sm:text-lg">
            Loading your safety dashboard...
          </p>
        </div>

        {/* Enhanced Version Info */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-gray-600 text-sm font-medium">
              v1.0.0 • PWA Ready
            </span>
          </div>
        </div>

        {/* Enhanced Decorative Elements */}
        <div className="hidden sm:block absolute top-12 left-12 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="hidden sm:block absolute top-24 right-16 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="hidden sm:block absolute bottom-24 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="hidden sm:block absolute top-32 right-32 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="hidden sm:block absolute bottom-32 right-24 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
