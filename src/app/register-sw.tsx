"use client";
import { useEffect, useState } from "react";

// Type definition for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function RegisterSW() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  useEffect(() => {
    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Handle appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsPWAInstalled(true);
      setShowInstallButton(false);
    };

    // Handle display mode change
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsPWAInstalled(e.matches);
    };

    // Handle service worker update
    const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker available');
            // Force the new worker to take control
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            // Reload the page to use the new service worker
            window.location.reload();
          }
        });
      }
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            handleServiceWorkerUpdate(registration);
          });
          
          // Clear old caches when service worker updates
          if (registration.active) {
            registration.active.postMessage({ type: 'CLEAR_OLD_CACHES' });
          }
          
          // Force clear all caches to fix CSS issues
          if (registration.active) {
            registration.active.postMessage({ type: 'CLEAR_ALL_CACHES' });
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        console.log('Prompting for installation...');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Installation outcome:', outcome);
        
        setDeferredPrompt(null);
        setShowInstallButton(false);
        
        if (outcome === 'accepted') {
          console.log('User accepted installation');
        } else {
          console.log('User dismissed installation');
        }
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };

  const handleClearCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
        
        // Reload the page to ensure fresh CSS
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear caches:', error);
      }
    }
  };

  // Don't show anything if PWA is already installed
  if (isPWAInstalled) {
    return null;
  }

  // Show install button when ready
  if (showInstallButton) {
    return (
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <button
          onClick={handleInstallClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200"
        >
          <span>📱</span>
          <span>Install App</span>
        </button>
        <button
          onClick={handleClearCaches}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200 text-sm"
        >
          <span>🗑️</span>
          <span>Clear Caches</span>
        </button>
      </div>
    );
  }
  
  return null;
}