import { useState } from "react";
import { Paintbrush, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PRESET_THEMES = [
  { name: 'Ocean', primary: '220 70% 50%', accent: '200 80% 60%' },
  { name: 'Forest', primary: '140 60% 45%', accent: '160 70% 55%' },
  { name: 'Sunset', primary: '20 90% 60%', accent: '40 85% 65%' },
  { name: 'Lavender', primary: '280 60% 60%', accent: '260 70% 70%' },
  { name: 'Rose', primary: '350 70% 60%', accent: '330 80% 70%' },
  { name: 'Mint', primary: '160 50% 55%', accent: '180 60% 65%' },
];

const SEASONAL_THEMES = [
  { name: 'Spring', primary: '110 60% 50%', accent: '80 70% 60%', gradient: 'from-green-100 via-yellow-100 to-pink-100' },
  { name: 'Summer', primary: '200 80% 55%', accent: '50 90% 65%', gradient: 'from-blue-200 via-cyan-200 to-yellow-200' },
  { name: 'Autumn', primary: '30 70% 50%', accent: '15 80% 60%', gradient: 'from-orange-200 via-red-200 to-yellow-200' },
  { name: 'Winter', primary: '210 60% 60%', accent: '190 70% 70%', gradient: 'from-blue-100 via-slate-100 to-cyan-100' },
];

export function ThemeCustomizer() {
  const [customPrimary, setCustomPrimary] = useState([220]);
  const [customSaturation, setCustomSaturation] = useState([70]);
  const [customLightness, setCustomLightness] = useState([50]);

  const applyTheme = (primary: string, accent: string) => {
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--accent', accent);
    
    // Save to localStorage
    localStorage.setItem('custom-theme', JSON.stringify({ primary, accent }));
    
    toast.success('Theme applied successfully');
  };

  const applyCustomTheme = () => {
    const primary = `${customPrimary[0]} ${customSaturation[0]}% ${customLightness[0]}%`;
    const accent = `${(customPrimary[0] + 30) % 360} ${customSaturation[0]}% ${Math.min(customLightness[0] + 10, 90)}%`;
    applyTheme(primary, accent);
  };

  const resetTheme = () => {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--accent');
    localStorage.removeItem('custom-theme');
    toast.success('Theme reset to default');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Paintbrush className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-semibold">Theme Customizer</h3>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {PRESET_THEMES.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:border-primary"
                onClick={() => applyTheme(theme.primary, theme.accent)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <span className="font-semibold">{theme.name}</span>
                </div>
                <div className="flex gap-1 w-full">
                  <div
                    className="h-2 flex-1 rounded"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <div
                    className="h-2 flex-1 rounded"
                    style={{ backgroundColor: `hsl(${theme.accent})` }}
                  />
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {SEASONAL_THEMES.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:border-primary"
                onClick={() => applyTheme(theme.primary, theme.accent)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{theme.name}</span>
                </div>
                <div className={`h-8 w-full rounded bg-gradient-to-r ${theme.gradient}`} />
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Seasonal themes adapt to the time of year
          </p>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hue (Color) - {customPrimary[0]}°</Label>
              <Slider
                value={customPrimary}
                onValueChange={setCustomPrimary}
                max={360}
                step={1}
                className="w-full"
              />
              <div className="h-8 rounded" style={{
                background: `linear-gradient(to right, 
                  hsl(0, ${customSaturation[0]}%, ${customLightness[0]}%),
                  hsl(60, ${customSaturation[0]}%, ${customLightness[0]}%),
                  hsl(120, ${customSaturation[0]}%, ${customLightness[0]}%),
                  hsl(180, ${customSaturation[0]}%, ${customLightness[0]}%),
                  hsl(240, ${customSaturation[0]}%, ${customLightness[0]}%),
                  hsl(300, ${customSaturation[0]}%, ${customLightness[0]}%),
                  hsl(360, ${customSaturation[0]}%, ${customLightness[0]}%)
                )`
              }} />
            </div>

            <div className="space-y-2">
              <Label>Saturation - {customSaturation[0]}%</Label>
              <Slider
                value={customSaturation}
                onValueChange={setCustomSaturation}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Lightness - {customLightness[0]}%</Label>
              <Slider
                value={customLightness}
                onValueChange={setCustomLightness}
                max={100}
                step={1}
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <div
                className="w-16 h-16 rounded-full"
                style={{
                  backgroundColor: `hsl(${customPrimary[0]}, ${customSaturation[0]}%, ${customLightness[0]}%)`
                }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground">
                  hsl({customPrimary[0]}, {customSaturation[0]}%, {customLightness[0]}%)
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyCustomTheme} className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                Apply Theme
              </Button>
              <Button onClick={resetTheme} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
