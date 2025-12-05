import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, Bell, Volume2, Vibrate, Layout, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMobilePreferences } from '@/hooks/useMobilePreferences';
import { cn } from '@/lib/utils';

const AVAILABLE_WIDGETS = [
  { id: 'balance', label: 'Balance', icon: '💰' },
  { id: 'budget', label: 'Budget Status', icon: '📊' },
  { id: 'goals', label: 'Goals Progress', icon: '🎯' },
  { id: 'spending', label: 'Daily Spending', icon: '💳' },
  { id: 'alerts', label: 'Alerts', icon: '🔔' },
  { id: 'streak', label: 'Savings Streak', icon: '🔥' },
];

export default function MobileSettings() {
  const navigate = useNavigate();
  const { preferences, updatePreferences, isLoading } = useMobilePreferences();
  
  const [hapticEnabled, setHapticEnabled] = useState(
    preferences?.haptic_enabled ?? true
  );
  const [hapticIntensity, setHapticIntensity] = useState<'light' | 'medium' | 'heavy'>(
    preferences?.haptic_intensity ?? 'medium'
  );
  const [voiceEnabled, setVoiceEnabled] = useState(
    preferences?.voice_enabled ?? true
  );
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(
    preferences?.quick_glance_widgets ?? ['balance', 'budget', 'goals']
  );

  const handleSave = async () => {
    await updatePreferences({
      haptic_enabled: hapticEnabled,
      haptic_intensity: hapticIntensity,
      voice_enabled: voiceEnabled,
      quick_glance_widgets: selectedWidgets,
    });
    navigate(-1);
  };

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId].slice(0, 4) // Max 4 widgets
    );
  };

  const intensityToSlider = (intensity: 'light' | 'medium' | 'heavy'): number => {
    switch (intensity) {
      case 'light': return 33;
      case 'medium': return 66;
      case 'heavy': return 100;
    }
  };

  const sliderToIntensity = (value: number): 'light' | 'medium' | 'heavy' => {
    if (value <= 33) return 'light';
    if (value <= 66) return 'medium';
    return 'heavy';
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-bg-strong backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Mobile Settings</h1>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 pb-24">
          {/* Quick Glance Widgets */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Layout className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-medium">Quick Glance Widgets</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose up to 4 widgets for your home screen quick glance
            </p>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_WIDGETS.map((widget) => (
                <motion.button
                  key={widget.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWidget(widget.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    selectedWidgets.includes(widget.id)
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border"
                  )}
                >
                  <span className="text-2xl mb-2 block">{widget.icon}</span>
                  <span className="text-sm font-medium">{widget.label}</span>
                  {selectedWidgets.includes(widget.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <span className="text-[10px] text-primary-foreground font-bold">
                        {selectedWidgets.indexOf(widget.id) + 1}
                      </span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Haptic Feedback */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Vibrate className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Haptic Feedback</h3>
                  <p className="text-sm text-muted-foreground">Vibration on interactions</p>
                </div>
              </div>
              <Switch
                checked={hapticEnabled}
                onCheckedChange={setHapticEnabled}
              />
            </div>
            {hapticEnabled && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Intensity</span>
                  <span className="text-sm font-medium capitalize">{hapticIntensity}</span>
                </div>
                <Slider
                  value={[intensityToSlider(hapticIntensity)]}
                  onValueChange={([value]) => setHapticIntensity(sliderToIntensity(value))}
                  min={0}
                  max={100}
                  step={33}
                  className="w-full"
                />
              </div>
            )}
          </section>

          {/* Voice Settings */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Voice Input</h3>
                  <p className="text-sm text-muted-foreground">Enable voice commands</p>
                </div>
              </div>
              <Switch
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </div>
          </section>

          {/* Notification Settings Link */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <h3 className="font-medium">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Manage push notifications</p>
                </div>
              </div>
              <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
            </button>
          </section>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
