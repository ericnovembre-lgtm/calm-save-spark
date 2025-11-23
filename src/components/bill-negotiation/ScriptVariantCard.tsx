import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScriptPersonalityProfile } from "./ScriptPersonalityProfile";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Flame, Heart, BarChart3, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriptVariantCardProps {
  variant: 'aggressive' | 'friendly' | 'data_driven';
  script: string;
  winProbability: number;
  onPreview: () => void;
  onSelect: () => void;
}

const variantConfig = {
  aggressive: {
    icon: Flame,
    accentColor: 'warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/20',
    textColor: 'text-warning',
    badge: 'bg-warning/90 text-black',
    title: '🔥 ASSERTIVE',
    bestFor: 'High leverage situations',
  },
  friendly: {
    icon: Heart,
    accentColor: 'success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/20',
    textColor: 'text-success',
    badge: 'bg-success/90 text-white',
    title: '🤝 COLLABORATIVE',
    bestFor: 'Long-term customers',
  },
  data_driven: {
    icon: BarChart3,
    accentColor: 'accent',
    bgColor: 'bg-accent/5',
    borderColor: 'border-accent/20',
    textColor: 'text-accent',
    badge: 'bg-accent text-black',
    title: '📊 ANALYTICAL',
    bestFor: 'Market analysis available',
  },
};

export function ScriptVariantCard({
  variant,
  script,
  winProbability,
  onPreview,
  onSelect,
}: ScriptVariantCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const previewText = script.slice(0, 250) + (script.length > 250 ? '...' : '');

  return (
    <GlassPanel
      className={cn(
        "group p-6 transition-all hover:shadow-glass-elevated",
        config.borderColor
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className={config.badge}>
            {config.title}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {config.bestFor}
          </div>
        </div>

        {/* Personality Profile */}
        <ScriptPersonalityProfile variant={variant} />

        {/* Win Probability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Win Probability</span>
            <span className={`${config.textColor} font-semibold`}>
              {winProbability}%
            </span>
          </div>
          <Progress 
            value={winProbability} 
            className="h-2"
          />
        </div>

        {/* Script Preview */}
        <div className={cn(
          "p-3 rounded-xl text-sm text-foreground/80 line-clamp-4 min-h-[100px]",
          config.bgColor,
          "border",
          config.borderColor
        )}>
          {previewText}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onPreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Full Script
          </Button>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onSelect}
          >
            <Check className="w-4 h-4 mr-2" />
            Choose This Style
          </Button>
        </div>
      </motion.div>
    </GlassPanel>
  );
}
