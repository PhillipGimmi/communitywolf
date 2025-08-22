'use client';

import { useEffect } from 'react';
import { useAuthStore } from './auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, loading, initialized } = useAuthStore();

  useEffect(() => {
    // Initialize auth store once when app loads
    console.log('📱 AuthProvider: Starting initialization...');
    console.log('🔧 AuthProvider: Current state:', { loading, initialized });
    
    const initPromise = initialize();
    
    // Log the promise for debugging
    console.log('🔧 AuthProvider: Initialize promise created:', initPromise instanceof Promise);
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      const state = useAuthStore.getState();
      console.log('⏰ AuthProvider: Fallback timeout triggered, checking state:', {
        loading: state.loading,
        initialized: state.initialized,
        isAuthenticated: state.isAuthenticated
      });
      
      if (state.loading && !state.initialized) {
        console.warn('⏰ AuthProvider: Auth initialization timeout - forcing completion');
        useAuthStore.setState({ 
          loading: false, 
          initialized: true,
          isAuthenticated: false,
          user: null,
          userProfile: null
        });
        console.log('✅ AuthProvider: State forced to completion');
      } else {
        console.log('✅ AuthProvider: State already completed, no action needed');
      }
    }, 5000); // Reduced to 5 second fallback
    
    return () => {
      console.log('🧹 AuthProvider: Cleanup function called, clearing timeout');
      clearTimeout(fallbackTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialize]); // Removed loading and initialized from dependencies to prevent re-runs

  console.log('📱 AuthProvider: Rendering with state:', { loading, initialized });

  return <>{children}</>;
}
