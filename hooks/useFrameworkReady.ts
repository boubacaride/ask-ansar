import { useEffect } from 'react';
import { Platform } from 'react-native';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Ensure the window object exists and frameworkReady is a function
      if (typeof window !== 'undefined' && typeof window.frameworkReady === 'function') {
        // Delay the framework ready call to ensure proper initialization
        const timeout = setTimeout(() => {
          window.frameworkReady();
        }, 0);
        return () => clearTimeout(timeout);
      }
    }
    // Native platforms don't use frameworkReady
  }, []);
}