import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useHapticSettings } from "@/hooks/useHapticSettings";
import { haptics, HapticIntensity, HapticPattern } from "@/lib/haptics";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Vibrate, Info, Smartphone } from "lucide-react";
import { toast } from "sonner";

const INTENSITY_OPTIONS: { value: HapticIntensity; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Subtle feedback' },
  { value: 'medium', label: 'Medium', description: 'Balanced response' },
  { value: 'heavy', label: 'Strong', description: 'Pronounced vibration' },
];

const TEST_PATTERNS: { pattern: HapticPattern; label: string }[] = [
  { pattern: 'tap', label: 'Tap' },
  { pattern: 'success', label: 'Success' },
  { pattern: 'error', label: 'Error' },
  { pattern: 'warning', label: 'Warning' },
  { pattern: 'achievement', label: 'Achievement' },
];

export const HapticSettings = () => {
  const { preferences, updatePreference, isAvailable } = useHapticSettings();
  const prefersReducedMotion = useReducedMotion();

  const handleTestPattern = (pattern: HapticPattern) => {
    if (!isAvailable) {
      toast.error('Haptic feedback not supported on this device');
      return;
    }
    if (prefersReducedMotion) {
      toast.info('Haptics disabled due to reduced motion preference');
      return;
    }
    if (!preferences.enabled) {
      toast.info('Enable haptic feedback to test');
      return;
    }
    haptics.pattern(pattern);
  };

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="haptic-enabled" className="text-base font-medium flex items-center gap-2">
            <Vibrate className="h-4 w-4 text-muted-foreground" />
            Haptic Feedback
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable vibration feedback for interactions
          </p>
        </div>
        <Switch
          id="haptic-enabled"
          checked={preferences.enabled}
          onCheckedChange={(checked) => {
            updatePreference('enabled', checked);
            if (checked && isAvailable) {
              haptics.vibrate('medium');
            }
            toast.success(checked ? 'Haptic feedback enabled' : 'Haptic feedback disabled');
          }}
          disabled={!isAvailable || prefersReducedMotion}
        />
      </div>

      {preferences.enabled && isAvailable && !prefersReducedMotion && (
        <>
          {/* Intensity Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Vibration Intensity</Label>
            <RadioGroup
              value={preferences.intensity}
              onValueChange={(value) => {
                updatePreference('intensity', value as HapticIntensity);
                haptics.vibrate(value as HapticIntensity);
              }}
              className="grid grid-cols-3 gap-3"
            >
              {INTENSITY_OPTIONS.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`intensity-${option.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`intensity-${option.value}`}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Test Patterns */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Test Haptic Patterns</Label>
            <div className="flex flex-wrap gap-2">
              {TEST_PATTERNS.map(({ pattern, label }) => (
                <Button
                  key={pattern}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestPattern(pattern)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Info Notice */}
      {(!isAvailable || prefersReducedMotion) && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            {!isAvailable ? (
              <span className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5" />
                Haptic feedback is not supported on this device
              </span>
            ) : (
              <span>
                Haptic feedback is disabled because you have "Reduce Motion" enabled in your system preferences
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
