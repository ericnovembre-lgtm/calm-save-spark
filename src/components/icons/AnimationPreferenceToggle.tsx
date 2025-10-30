import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAnimationPreference, setAnimationPreference, getAnimationPreference } from '@/hooks/useAnimationPreference';
import { Sparkles, SparklesIcon } from 'lucide-react';

/**
 * Toggle component for user animation preferences
 * 
 * Allows users to enable/disable animated icons across the app.
 * This preference is stored in localStorage and syncs across tabs.
 */
export function AnimationPreferenceToggle() {
  const isAnimationEnabled = useAnimationPreference();
  const [isChecked, setIsChecked] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsChecked(getAnimationPreference());
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsChecked(isAnimationEnabled);
    }
  }, [isAnimationEnabled, isMounted]);

  const handleToggle = (checked: boolean) => {
    setIsChecked(checked);
    setAnimationPreference(checked);
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <Switch disabled />
        <Label className="text-sm text-muted-foreground">Loading preferences...</Label>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center space-x-3">
        <Sparkles className="w-5 h-5 text-foreground" />
        <div className="space-y-0.5">
          <Label 
            htmlFor="animation-toggle" 
            className="text-sm font-medium cursor-pointer"
          >
            Animated Icons
          </Label>
          <p className="text-xs text-muted-foreground">
            Enable playful animations throughout the app
          </p>
        </div>
      </div>
      <Switch
        id="animation-toggle"
        checked={isChecked}
        onCheckedChange={handleToggle}
        aria-label="Toggle animated icons"
      />
    </div>
  );
}

/**
 * Compact version for settings menus
 */
export function AnimationPreferenceToggleCompact() {
  const isAnimationEnabled = useAnimationPreference();
  const [isChecked, setIsChecked] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsChecked(getAnimationPreference());
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsChecked(isAnimationEnabled);
    }
  }, [isAnimationEnabled, isMounted]);

  const handleToggle = (checked: boolean) => {
    setIsChecked(checked);
    setAnimationPreference(checked);
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-between space-x-2">
      <Label htmlFor="animation-toggle-compact" className="text-sm cursor-pointer">
        Animated Icons
      </Label>
      <Switch
        id="animation-toggle-compact"
        checked={isChecked}
        onCheckedChange={handleToggle}
        aria-label="Toggle animated icons"
      />
    </div>
  );
}
