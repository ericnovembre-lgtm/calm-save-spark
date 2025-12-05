import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasBiometrics: boolean;
  hasVibration: boolean;
  hasPushSupport: boolean;
  hasServiceWorker: boolean;
  isStandalone: boolean;
  isPWA: boolean;
  isNativeApp: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  platform: 'ios' | 'android' | 'web';
  screenSize: 'small' | 'medium' | 'large';
  hasNetworkInfo: boolean;
  connectionType: string | null;
  isOnline: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasCamera: false,
    hasMicrophone: false,
    hasBiometrics: false,
    hasVibration: false,
    hasPushSupport: false,
    hasServiceWorker: false,
    isStandalone: false,
    isPWA: false,
    isNativeApp: false,
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    platform: 'web',
    screenSize: 'large',
    hasNetworkInfo: false,
    connectionType: null,
    isOnline: navigator.onLine
  });

  useEffect(() => {
    const detectCapabilities = async () => {
      const ua = navigator.userAgent.toLowerCase();
      
      // Device type detection
      const isIOS = /iphone|ipad|ipod/.test(ua);
      const isAndroid = /android/.test(ua);
      const isMobile = /mobile|android|iphone|ipod/.test(ua);
      const isTablet = /ipad|tablet|playbook/.test(ua) || 
        (isAndroid && !/mobile/.test(ua));
      
      // Platform detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      
      // Check if running in Capacitor
      const isNativeApp = typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== 'undefined';
      
      // Screen size
      const width = window.innerWidth;
      const screenSize: 'small' | 'medium' | 'large' = 
        width < 640 ? 'small' : width < 1024 ? 'medium' : 'large';
      
      // Feature detection
      const hasVibration = 'vibrate' in navigator;
      const hasPushSupport = 'PushManager' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      // Media devices
      let hasCamera = false;
      let hasMicrophone = false;
      
      if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          hasCamera = devices.some(d => d.kind === 'videoinput');
          hasMicrophone = devices.some(d => d.kind === 'audioinput');
        } catch {
          // Permission denied or error
        }
      }
      
      // Biometrics (WebAuthn)
      const hasBiometrics = 'credentials' in navigator && 
        'PublicKeyCredential' in window &&
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
      
      // Network info
      const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
      const hasNetworkInfo = !!connection;
      const connectionType = connection?.effectiveType || null;

      setCapabilities({
        hasCamera,
        hasMicrophone,
        hasBiometrics,
        hasVibration,
        hasPushSupport,
        hasServiceWorker,
        isStandalone,
        isPWA: isStandalone && !isNativeApp,
        isNativeApp,
        isMobile,
        isTablet,
        isIOS,
        isAndroid,
        platform: isNativeApp ? (isIOS ? 'ios' : 'android') : 'web',
        screenSize,
        hasNetworkInfo,
        connectionType,
        isOnline: navigator.onLine
      });
    };

    detectCapabilities();

    // Listen for online/offline
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return capabilities;
}
