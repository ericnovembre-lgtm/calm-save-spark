import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";
import { Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const MotionAccessibilitySettings = () => {
  const { preferences, updatePreference, resetToDefaults, disableAll, batteryLevel, isLowPowerMode, rawPreferences } = useMotionPreferences();

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreference(key, value);
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Control motion effects throughout the app. These settings work alongside your system's
          "Reduce Motion" preference for enhanced accessibility.
        </p>
      </div>

      {/* Battery Status */}
      {isLowPowerMode && (
        <div className="flex items-start gap-2 text-sm bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
          <div>
            <p className="font-medium text-yellow-500">Battery Saver Active</p>
            <p className="text-muted-foreground mt-1">
              Motion effects have been automatically reduced to conserve battery. 
              Battery level: {batteryLevel ? Math.round(batteryLevel * 100) : '—'}%
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Battery Aware Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="battery-aware" className="text-base font-medium">
              Battery-Aware Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically reduce motion effects when battery is low
            </p>
          </div>
          <Switch
            id="battery-aware"
            checked={rawPreferences?.batteryAware ?? true}
            onCheckedChange={(checked) => handleToggle('batteryAware', checked)}
          />
        </div>

        {/* Animations Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="animations" className="text-base font-medium">
              Page Animations
            </Label>
            <p className="text-sm text-muted-foreground">
              Fade-in, slide, and scale effects on page transitions and components
            </p>
          </div>
          <Switch
            id="animations"
            checked={preferences.animations}
            onCheckedChange={(checked) => handleToggle('animations', checked)}
          />
        </div>

        {/* Particles Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="particles" className="text-base font-medium">
              Background Particles
            </Label>
            <p className="text-sm text-muted-foreground">
              Floating particle effects and interactive backgrounds
            </p>
          </div>
          <Switch
            id="particles"
            checked={preferences.particles}
            onCheckedChange={(checked) => handleToggle('particles', checked)}
          />
        </div>

        {/* Gradients Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="gradients" className="text-base font-medium">
              Dynamic Gradients
            </Label>
            <p className="text-sm text-muted-foreground">
              Mouse-following and scroll-reactive gradient effects
            </p>
          </div>
          <Switch
            id="gradients"
            checked={preferences.gradients}
            onCheckedChange={(checked) => handleToggle('gradients', checked)}
          />
        </div>

        {/* Haptics Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="haptics" className="text-base font-medium">
              Haptic Feedback
            </Label>
            <p className="text-sm text-muted-foreground">
              Vibration feedback on mobile devices for interactions
            </p>
          </div>
          <Switch
            id="haptics"
            checked={preferences.haptics}
            onCheckedChange={(checked) => handleToggle('haptics', checked)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            disableAll();
            toast.success('All motion effects disabled');
          }}
        >
          Disable All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetToDefaults();
            toast.success('Motion preferences reset to defaults');
          }}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
