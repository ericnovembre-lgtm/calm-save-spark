import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScriptPersonalityProfile } from "./ScriptPersonalityProfile";
import { Flame, Heart, BarChart3, Eye, Check } from "lucide-react";

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
    color: 'red',
    bgColor: 'bg-red-950/20',
    borderColor: 'border-red-500/30',
    hoverBorder: 'hover:border-red-500',
    badge: 'bg-red-600',
    title: '🔥 AGGRESSIVE',
    bestFor: 'High leverage situations',
    glowColor: 'from-red-500/20 to-orange-500/20',
  },
  friendly: {
    icon: Heart,
    color: 'emerald',
    bgColor: 'bg-emerald-950/20',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500',
    badge: 'bg-emerald-600',
    title: '🤝 FRIENDLY',
    bestFor: 'Long-term customers',
    glowColor: 'from-emerald-500/20 to-green-500/20',
  },
  data_driven: {
    icon: BarChart3,
    color: 'cyan',
    bgColor: 'bg-cyan-950/20',
    borderColor: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-500',
    badge: 'bg-cyan-600',
    title: '📊 DATA-DRIVEN',
    bestFor: 'Market analysis available',
    glowColor: 'from-cyan-500/20 to-blue-500/20',
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative p-6 bg-slate-900 border-2 ${config.borderColor} ${config.hoverBorder} rounded-xl transition-all`}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.glowColor} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
      
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className={`${config.badge} text-white font-bold`}>
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
            <span className={`text-${config.color}-400 font-mono font-bold`}>
              {winProbability}%
            </span>
          </div>
          <Progress 
            value={winProbability} 
            className={`h-2 bg-${config.color}-950`}
          />
        </div>

        {/* Script Preview */}
        <div className={`p-3 ${config.bgColor} border ${config.borderColor} rounded text-sm text-foreground/80 line-clamp-4 min-h-[100px]`}>
          {previewText}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className={`w-full ${config.borderColor}`}
            onClick={onPreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Full Script
          </Button>
          <Button
            className={`w-full bg-${config.color}-600 hover:bg-${config.color}-500`}
            onClick={onSelect}
          >
            <Check className="w-4 h-4 mr-2" />
            Choose This Style
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
