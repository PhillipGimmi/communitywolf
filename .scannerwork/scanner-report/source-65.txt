'use client';

import { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';

export function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide splash screen after a minimum display time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Minimum 2 seconds

    // Also hide when page is fully loaded
    const handleLoad = () => {
      setTimeout(() => setIsLoading(false), 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  if (!isLoading) return null;

  return <SplashScreen />;
}
