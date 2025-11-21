import { motion } from 'framer-motion';
import { Palette, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  name: string;
}

export function GenerativeTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemePalette>({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    name: 'Ocean Breeze'
  });

  const themes: ThemePalette[] = [
    { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#10b981', name: 'Ocean Breeze' },
    { primary: '#f59e0b', secondary: '#ef4444', accent: '#ec4899', name: 'Sunset Glow' },
    { primary: '#10b981', secondary: '#06b6d4', accent: '#6366f1', name: 'Forest Dawn' },
    { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b', name: 'Purple Haze' }
  ];

  const generateRandom = () => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setCurrentTheme(randomTheme);
    toast.success(`Theme changed to ${randomTheme.name}`);
  };

  const applyTheme = () => {
    toast.success('Theme applied successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Generative Theme</h3>
            <p className="text-sm text-muted-foreground">AI-created color palettes</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={generateRandom}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <motion.div
        key={currentTheme.name}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold text-foreground mb-2">{currentTheme.name}</h4>
          <p className="text-sm text-muted-foreground">Custom AI-generated palette</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="aspect-square rounded-2xl border-4 border-border/50 p-4 flex flex-col justify-end"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <p className="text-white text-xs font-medium">Primary</p>
            <p className="text-white/70 text-xs font-mono">{currentTheme.primary}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="aspect-square rounded-2xl border-4 border-border/50 p-4 flex flex-col justify-end"
            style={{ backgroundColor: currentTheme.secondary }}
          >
            <p className="text-white text-xs font-medium">Secondary</p>
            <p className="text-white/70 text-xs font-mono">{currentTheme.secondary}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="aspect-square rounded-2xl border-4 border-border/50 p-4 flex flex-col justify-end"
            style={{ backgroundColor: currentTheme.accent }}
          >
            <p className="text-white text-xs font-medium">Accent</p>
            <p className="text-white/70 text-xs font-mono">{currentTheme.accent}</p>
          </motion.div>
        </div>

        <div className="flex gap-3">
          <Button onClick={generateRandom} variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Surprise Me
          </Button>
          <Button onClick={applyTheme} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Apply Theme
          </Button>
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {themes.map((theme, i) => (
          <button
            key={i}
            onClick={() => setCurrentTheme(theme)}
            className="h-12 rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors"
          >
            <div className="h-full flex">
              <div className="flex-1" style={{ backgroundColor: theme.primary }} />
              <div className="flex-1" style={{ backgroundColor: theme.secondary }} />
              <div className="flex-1" style={{ backgroundColor: theme.accent }} />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
