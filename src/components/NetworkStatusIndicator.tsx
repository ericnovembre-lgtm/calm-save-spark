import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ConnectionQuality = 'fast' | 'slow' | 'offline';

/**
 * Get connection quality based on various metrics
 */
const getConnectionQuality = (): ConnectionQuality => {
  if (!navigator.onLine) return 'offline';
  
  const connection = (navigator as any).connection;
  if (!connection) return 'fast'; // Assume fast if API not available
  
  const effectiveType = connection.effectiveType;
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'offline';
  
  // Check downlink speed (Mbps)
  if (connection.downlink > 5) return 'fast';
  if (connection.downlink > 1.5) return 'slow';
  
  return 'slow';
};

/**
 * NetworkStatusIndicator
 * Shows connection quality and adjusts loading strategy
 */
export const NetworkStatusIndicator = () => {
  const [quality, setQuality] = useState<ConnectionQuality>('fast');
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateConnection = () => {
      const newQuality = getConnectionQuality();
      setQuality(newQuality);
      
      // Only show indicator if connection is slow or offline
      setShowIndicator(newQuality === 'slow' || newQuality === 'offline');
    };

    // Initial check
    updateConnection();

    // Listen for connection changes
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnection);
    }

    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
      if (connection) {
        connection.removeEventListener('change', updateConnection);
      }
    };
  }, []);

  // Adjust loading strategy based on connection
  useEffect(() => {
    if (quality === 'offline') {
      // Disable prefetching, reduce animations
      document.body.dataset.connectionQuality = 'offline';
    } else if (quality === 'slow') {
      // Reduce prefetching, simplified animations
      document.body.dataset.connectionQuality = 'slow';
    } else {
      // Full features
      document.body.dataset.connectionQuality = 'fast';
    }
  }, [quality]);

  const getIcon = () => {
    switch (quality) {
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'slow':
        return <SignalLow className="w-4 h-4" />;
      case 'fast':
        return <Signal className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (quality) {
      case 'offline':
        return 'Offline';
      case 'slow':
        return 'Slow Connection';
      case 'fast':
        return 'Fast Connection';
    }
  };

  const getVariant = () => {
    switch (quality) {
      case 'offline':
        return 'destructive';
      case 'slow':
        return 'secondary';
      case 'fast':
        return 'default';
    }
  };

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <Badge 
            variant={getVariant()}
            className="flex items-center gap-2 px-3 py-2 backdrop-blur-sm"
          >
            {getIcon()}
            <span className="text-sm font-medium">{getLabel()}</span>
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
