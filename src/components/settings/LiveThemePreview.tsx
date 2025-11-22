import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/use-theme';
import { motion } from 'framer-motion';

const accentColors = [
  { name: 'Default', value: '#d6c8a2' },
  { name: 'Warm Gold', value: '#d4af37' },
  { name: 'Rose', value: '#e8b4a0' },
  { name: 'Sage', value: '#a8b5a0' },
  { name: 'Slate', value: '#a0a8b5' },
];

export function LiveThemePreview() {
  const { theme: storeTheme, accentColor, fontSize, setTheme, setAccentColor, setFontSize } = useSettingsStore();
  const { setTheme: applyTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Live Theme Preview
        </CardTitle>
        <CardDescription>
          Customize your app's appearance with real-time preview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Theme Mode</Label>
              <RadioGroup value={storeTheme} onValueChange={handleThemeChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="font-normal cursor-pointer">
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="font-normal cursor-pointer">
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="font-normal cursor-pointer">
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Accent Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      accentColor === color.value
                        ? 'border-primary scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Font Size: {fontSize > 0 ? '+' : ''}{fontSize}</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([value]) => setFontSize(value)}
                min={-2}
                max={2}
                step={1}
                className="w-full"
              />
            </div>

            <Button variant="outline" size="sm" onClick={() => {
              setTheme('system');
              setAccentColor('#d6c8a2');
              setFontSize(0);
              applyTheme('system');
            }}>
              Reset to Defaults
            </Button>
          </div>

          {/* Mini Phone Preview */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="w-[200px] h-[400px] rounded-[32px] border-8 border-foreground/20 bg-background overflow-hidden shadow-2xl">
                <div className="h-full overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-3 rounded-full bg-foreground/30" />
                    <div className="w-12 h-3 rounded-full bg-foreground/30" />
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <div className="text-xs font-semibold" style={{ fontSize: `${0.75 + fontSize * 0.0625}rem` }}>
                      Balance
                    </div>
                    <div className="text-lg font-bold" style={{ fontSize: `${1.125 + fontSize * 0.0625}rem` }}>
                      $5,234.56
                    </div>
                  </div>

                  <div 
                    className="h-20 rounded-lg p-3 space-y-1"
                    style={{ backgroundColor: accentColor, opacity: 0.2 }}
                  >
                    <div className="w-20 h-2 rounded bg-foreground/30" />
                    <div className="w-16 h-2 rounded bg-foreground/30" />
                  </div>

                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="w-16 h-2 rounded bg-foreground/30" />
                        <div className="w-12 h-2 rounded bg-foreground/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-foreground/20" />
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
