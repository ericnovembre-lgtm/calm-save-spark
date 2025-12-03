import { motion } from 'framer-motion';
import { Brain, Zap, Globe, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelIndicatorBadgeProps {
  model: string;
  modelName: string;
  queryType: string;
  isLoading?: boolean;
}

const MODEL_CONFIG = {
  'claude-sonnet': {
    icon: Brain,
    label: 'Claude Sonnet 4.5',
    color: 'from-violet-500 to-purple-600',
    description: 'Advanced reasoning'
  },
  'gemini-flash': {
    icon: Zap,
    label: 'Gemini 3 Pro',
    color: 'from-cyan-500 to-blue-600',
    description: 'Fast & efficient'
  },
  'gemini-3-pro': {
    icon: Zap,
    label: 'Gemini 3 Pro',
    color: 'from-cyan-500 to-blue-600',
    description: 'Fast & efficient'
  },
  'perplexity': {
    icon: Globe,
    label: 'Perplexity',
    color: 'from-green-500 to-emerald-600',
    description: 'Real-time data'
  },
  'gpt-5': {
    icon: FileText,
    label: 'GPT-5',
    color: 'from-emerald-500 to-teal-600',
    description: 'Document expert'
  }
};

export function ModelIndicatorBadge({ model, modelName, queryType, isLoading }: ModelIndicatorBadgeProps) {
  const config = MODEL_CONFIG[model as keyof typeof MODEL_CONFIG] || MODEL_CONFIG['gemini-flash'];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        "bg-gradient-to-r text-white shadow-lg",
        config.color,
        isLoading && "animate-pulse"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      <span className="opacity-60">• {config.description}</span>
    </motion.div>
  );
}
