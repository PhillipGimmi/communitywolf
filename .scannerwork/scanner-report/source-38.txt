'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, usePathname } from 'next/navigation';
import { SecureSignupForm } from './SecureSignupForm';
import { SecureLoginForm } from './SecureLoginForm';

export function AuthContainer() {
  const pathname = usePathname();
  const [isSignup, setIsSignup] = useState(false);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  // Set the correct form based on the current route
  useEffect(() => {
    setIsSignup(pathname === '/auth/signup');
  }, [pathname]);

  const toggleMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isSignup ? 'Join our community today' : 'Welcome back'}
          </p>
        </div>

        {/* Show message from URL if present */}
        {message && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isSignup ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <SecureSignupForm />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <SecureLoginForm />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="font-medium text-gray-900 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              aria-label={isSignup ? 'Switch to sign in form' : 'Switch to sign up form'}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
