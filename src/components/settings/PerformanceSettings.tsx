/**
 * PerformanceSettings - User-configurable performance options
 */
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Zap, 
  Cpu, 
  Image, 
  RefreshCw, 
  Trash2,
  Box,
  Wifi,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearQueryCache } from '@/lib/query-persistence';
import { cn } from '@/lib/utils';

interface PerformancePreferences {
  enable3DEffects: boolean;
  enableAnimations: boolean;
  enableBackgroundSync: boolean;
  dataSaverMode: boolean;
  prefetchAggressiveness: number; // 0-100
  imageLazyLoad: boolean;
}

const STORAGE_KEY = 'performance_preferences';

const DEFAULT_PREFERENCES: PerformancePreferences = {
  enable3DEffects: true,
  enableAnimations: true,
  enableBackgroundSync: true,
  dataSaverMode: false,
  prefetchAggressiveness: 50,
  imageLazyLoad: true,
};

/**
 * Detect if device is low-end
 */
const isLowEndDevice = (): boolean => {
  // Check device memory (Chrome only)
  if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
    return true;
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  
  // Check connection type
  const connection = (navigator as any).connection;
  if (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
    return true;
  }
  
  return false;
};

export function PerformanceSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<PerformancePreferences>(DEFAULT_PREFERENCES);
  const [isClearing, setIsClearing] = useState(false);
  const [showLowEndWarning, setShowLowEndWarning] = useState(false);

  // Load preferences
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
    } else if (isLowEndDevice()) {
      // Auto-configure for low-end devices
      const lowEndPrefs: PerformancePreferences = {
        enable3DEffects: false,
        enableAnimations: false,
        enableBackgroundSync: false,
        dataSaverMode: true,
        prefetchAggressiveness: 20,
        imageLazyLoad: true,
      };
      setPreferences(lowEndPrefs);
      setShowLowEndWarning(true);
    }
  }, []);

  // Save preferences
  const updatePreference = <K extends keyof PerformancePreferences>(
    key: K,
    value: PerformancePreferences[K]
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Apply preference immediately if possible
    if (key === 'enableAnimations') {
      document.documentElement.style.setProperty(
        '--motion-duration',
        value ? '300ms' : '0ms'
      );
    }
  };

  // Clear cached data
  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      // Clear query cache
      await clearQueryCache();
      
      // Clear localStorage caches
      const keysToRemove = [
        'dashboard_cache',
        'performance_baselines',
        'prefetch_patterns',
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast({
        title: 'Cache cleared',
        description: 'All cached data has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cache.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Low-end device warning */}
      {showLowEndWarning && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <Cpu className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-500">
                Performance mode enabled
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We've automatically optimized settings for your device. You can adjust these settings below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3D Effects */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Box className="h-5 w-5 text-yellow-500" />
          <div>
            <Label htmlFor="3d-effects" className="font-medium">
              3D Effects
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable Three.js visualizations and 3D graphics
            </p>
          </div>
        </div>
        <Switch
          id="3d-effects"
          checked={preferences.enable3DEffects}
          onCheckedChange={(v) => updatePreference('enable3DEffects', v)}
        />
      </div>

      {/* Animations */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-amber-500" />
          <div>
            <Label htmlFor="animations" className="font-medium">
              Animations
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable smooth transitions and motion effects
            </p>
          </div>
        </div>
        <Switch
          id="animations"
          checked={preferences.enableAnimations}
          onCheckedChange={(v) => updatePreference('enableAnimations', v)}
        />
      </div>

      {/* Background Sync */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-emerald-500" />
          <div>
            <Label htmlFor="bg-sync" className="font-medium">
              Background Sync
            </Label>
            <p className="text-xs text-muted-foreground">
              Sync data in the background when idle
            </p>
          </div>
        </div>
        <Switch
          id="bg-sync"
          checked={preferences.enableBackgroundSync}
          onCheckedChange={(v) => updatePreference('enableBackgroundSync', v)}
        />
      </div>

      {/* Data Saver Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-amber-500" />
          <div>
            <Label htmlFor="data-saver" className="font-medium">
              Data Saver Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Reduce data usage by limiting prefetching
            </p>
          </div>
        </div>
        <Switch
          id="data-saver"
          checked={preferences.dataSaverMode}
          onCheckedChange={(v) => updatePreference('dataSaverMode', v)}
        />
      </div>

      {/* Image Lazy Loading */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image className="h-5 w-5 text-amber-500" />
          <div>
            <Label htmlFor="lazy-images" className="font-medium">
              Lazy Load Images
            </Label>
            <p className="text-xs text-muted-foreground">
              Load images only when visible on screen
            </p>
          </div>
        </div>
        <Switch
          id="lazy-images"
          checked={preferences.imageLazyLoad}
          onCheckedChange={(v) => updatePreference('imageLazyLoad', v)}
        />
      </div>

      {/* Prefetch Aggressiveness */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-rose-500" />
          <div>
            <Label className="font-medium">Prefetch Level</Label>
            <p className="text-xs text-muted-foreground">
              How aggressively to preload content ({preferences.prefetchAggressiveness}%)
            </p>
          </div>
        </div>
        <Slider
          value={[preferences.prefetchAggressiveness]}
          onValueChange={([v]) => updatePreference('prefetchAggressiveness', v)}
          max={100}
          step={10}
          disabled={preferences.dataSaverMode}
          className={cn(preferences.dataSaverMode && 'opacity-50')}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Conservative</span>
          <span>Aggressive</span>
        </div>
      </div>

      {/* Clear Cache Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleClearCache}
          disabled={isClearing}
          className="w-full"
        >
          {isClearing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Clear Cached Data
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Clears all cached data. App will reload fresh data on next visit.
        </p>
      </div>
    </div>
  );
}
