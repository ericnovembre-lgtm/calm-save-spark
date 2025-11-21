import { motion } from 'framer-motion';
import { Eye, Volume2, Contrast, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function AccessibilityAI() {
  const [features, setFeatures] = useState({
    autoAltText: true,
    smartContrast: true,
    voiceGuidance: false,
    focusManagement: true
  });

  const [score] = useState(98);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Accessibility AI</h3>
            <p className="text-sm text-muted-foreground">Intelligent accessibility features</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-green-500">{score}</p>
          <p className="text-xs text-muted-foreground">WCAG Score</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Auto Alt Text</p>
              <p className="text-sm text-muted-foreground">AI-generated descriptions</p>
            </div>
          </div>
          <Switch
            checked={features.autoAltText}
            onCheckedChange={(checked) => setFeatures({ ...features, autoAltText: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <Contrast className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Smart Contrast</p>
              <p className="text-sm text-muted-foreground">Adaptive color adjustments</p>
            </div>
          </div>
          <Switch
            checked={features.smartContrast}
            onCheckedChange={(checked) => setFeatures({ ...features, smartContrast: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Voice Guidance</p>
              <p className="text-sm text-muted-foreground">Natural language descriptions</p>
            </div>
          </div>
          <Switch
            checked={features.voiceGuidance}
            onCheckedChange={(checked) => setFeatures({ ...features, voiceGuidance: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Focus Management</p>
              <p className="text-sm text-muted-foreground">Predictive focus navigation</p>
            </div>
          </div>
          <Switch
            checked={features.focusManagement}
            onCheckedChange={(checked) => setFeatures({ ...features, focusManagement: checked })}
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
        <p className="text-sm text-foreground">
          <span className="font-semibold">All accessibility checks passed!</span> Your dashboard meets
          WCAG 2.1 AAA standards.
        </p>
      </div>
    </motion.div>
  );
}
