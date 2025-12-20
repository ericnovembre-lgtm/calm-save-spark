import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Keyboard,
  Volume2,
  Type,
  MousePointer2,
  Sparkles,
  MessageSquare,
  Accessibility,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  focusStyle: 'ring' | 'glow' | 'outline' | 'both';
  fontSize: number;
  linkUnderlines: boolean;
  animationsDisabled: boolean;
  announcementVerbosity: 'minimal' | 'normal' | 'verbose';
  keyboardHints: boolean;
  autoReadAlerts: boolean;
  floatingOrbsEnabled: boolean;
  hoverSoundsEnabled: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  focusStyle: 'ring',
  fontSize: 100,
  linkUnderlines: false,
  animationsDisabled: false,
  announcementVerbosity: 'normal',
  keyboardHints: false,
  autoReadAlerts: true,
  floatingOrbsEnabled: true,
  hoverSoundsEnabled: true,
};

/**
 * Comprehensive Accessibility Settings Panel
 * Central place for all accessibility preferences
 */
export function AccessibilitySettings() {
  const prefersReducedMotion = useReducedMotion();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const saved = localStorage.getItem('accessibility-preferences');
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Apply preferences
  useEffect(() => {
    // High contrast
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Font size
    document.documentElement.style.fontSize = `${preferences.fontSize}%`;

    // Link underlines
    if (preferences.linkUnderlines) {
      document.documentElement.classList.add('link-underlines');
    } else {
      document.documentElement.classList.remove('link-underlines');
    }

    // Reduced motion
    if (preferences.reducedMotion || preferences.animationsDisabled) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [preferences]);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    setHasChanges(false);
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new Event('accessibility-preferences-updated'));
    toast.success('Accessibility preferences saved');
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
    toast.info('Preferences reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Quick Summary */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="gap-1">
          <Accessibility className="h-3 w-3" />
          {prefersReducedMotion ? 'Reduced Motion Detected' : 'Full Motion'}
        </Badge>
        {preferences.highContrast && (
          <Badge variant="secondary" className="gap-1">
            <Eye className="h-3 w-3" />
            High Contrast
          </Badge>
        )}
        {preferences.fontSize !== 100 && (
          <Badge variant="secondary" className="gap-1">
            <Type className="h-3 w-3" />
            {preferences.fontSize}% Text
          </Badge>
        )}
      </div>

      {/* Visual Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-xs text-muted-foreground">
                WCAG AAA compliant colors
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(v) => updatePreference('highContrast', v)}
            />
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Text Size</Label>
              <span className="text-sm text-muted-foreground">{preferences.fontSize}%</span>
            </div>
            <Slider
              value={[preferences.fontSize]}
              onValueChange={([v]) => updatePreference('fontSize', v)}
              min={75}
              max={150}
              step={5}
              aria-label="Text size percentage"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller</span>
              <span>Default</span>
              <span>Larger</span>
            </div>
          </div>

          <Separator />

          {/* Link Underlines */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="link-underlines">Underline Links</Label>
              <p className="text-xs text-muted-foreground">
                Always show underlines on links
              </p>
            </div>
            <Switch
              id="link-underlines"
              checked={preferences.linkUnderlines}
              onCheckedChange={(v) => updatePreference('linkUnderlines', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Motion & Animation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Motion & Animation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={preferences.reducedMotion}
              onCheckedChange={(v) => updatePreference('reducedMotion', v)}
            />
          </div>

          <Separator />

          {/* Disable Animations Completely */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="disable-animations">Disable All Animations</Label>
              <p className="text-xs text-muted-foreground">
                Remove all motion effects completely
              </p>
            </div>
            <Switch
              id="disable-animations"
              checked={preferences.animationsDisabled}
              onCheckedChange={(v) => updatePreference('animationsDisabled', v)}
            />
          </div>

          <Separator />

          {/* Floating Ambient Effects */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="floating-orbs">Floating Ambient Effects</Label>
              <p className="text-xs text-muted-foreground">
                Show subtle floating orbs in background
              </p>
            </div>
            <Switch
              id="floating-orbs"
              checked={preferences.floatingOrbsEnabled}
              onCheckedChange={(v) => updatePreference('floatingOrbsEnabled', v)}
            />
          </div>

          <Separator />

          {/* Hover Sound Effects */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hover-sounds">Hover Sound Effects</Label>
              <p className="text-xs text-muted-foreground">
                Play sounds on hover and click interactions
              </p>
            </div>
            <Switch
              id="hover-sounds"
              checked={preferences.hoverSoundsEnabled}
              onCheckedChange={(v) => updatePreference('hoverSoundsEnabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Focus & Keyboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Focus & Keyboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Focus Style */}
          <div className="space-y-3">
            <Label>Focus Indicator Style</Label>
            <RadioGroup
              value={preferences.focusStyle}
              onValueChange={(v) => updatePreference('focusStyle', v as any)}
              className="grid grid-cols-2 gap-2"
            >
              {(['ring', 'glow', 'outline', 'both'] as const).map((style) => (
                <div key={style} className="flex items-center space-x-2">
                  <RadioGroupItem value={style} id={`focus-${style}`} />
                  <Label htmlFor={`focus-${style}`} className="capitalize cursor-pointer">
                    {style}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Keyboard Hints */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="keyboard-hints">Show Keyboard Hints</Label>
              <p className="text-xs text-muted-foreground">
                Display keyboard shortcuts on hover
              </p>
            </div>
            <Switch
              id="keyboard-hints"
              checked={preferences.keyboardHints}
              onCheckedChange={(v) => updatePreference('keyboardHints', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Screen Reader
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Announcement Verbosity */}
          <div className="space-y-3">
            <Label>Announcement Verbosity</Label>
            <RadioGroup
              value={preferences.announcementVerbosity}
              onValueChange={(v) => updatePreference('announcementVerbosity', v as any)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal" id="verbosity-minimal" />
                <Label htmlFor="verbosity-minimal" className="cursor-pointer">
                  <span className="font-medium">Minimal</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Essential announcements only
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="verbosity-normal" />
                <Label htmlFor="verbosity-normal" className="cursor-pointer">
                  <span className="font-medium">Normal</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Balanced announcements
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="verbose" id="verbosity-verbose" />
                <Label htmlFor="verbosity-verbose" className="cursor-pointer">
                  <span className="font-medium">Verbose</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Detailed announcements
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Auto-read Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-read">Auto-announce Alerts</Label>
              <p className="text-xs text-muted-foreground">
                Automatically announce important notifications
              </p>
            </div>
            <Switch
              id="auto-read"
              checked={preferences.autoReadAlerts}
              onCheckedChange={(v) => updatePreference('autoReadAlerts', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={savePreferences} disabled={!hasChanges}>
          <Check className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
