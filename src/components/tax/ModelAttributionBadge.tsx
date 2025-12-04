import { motion } from 'framer-motion';
import { FileText, Sparkles, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelAttributionBadgeProps {
  model: 'gpt-5' | 'gemini-2.5-flash' | 'gemini-flash' | 'deepseek-reasoner' | string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MODEL_CONFIG = {
  'gpt-5': {
    icon: FileText,
    label: 'GPT-5',
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
  },
  'gemini-2.5-flash': {
    icon: Sparkles,
    label: 'Gemini 2.5 Flash',
    gradient: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-500',
  },
  'gemini-flash': {
    icon: Sparkles,
    label: 'Gemini Flash',
    gradient: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-500',
  },
  'deepseek-reasoner': {
    icon: Calculator,
    label: 'Deepseek Reasoner',
    gradient: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-600/10',
    textColor: 'text-blue-500',
  },
};

export function ModelAttributionBadge({ 
  model, 
  showLabel = true, 
  size = 'md' 
}: ModelAttributionBadgeProps) {
  // Normalize model name
  const normalizedModel = model.toLowerCase().includes('gpt') ? 'gpt-5' : 
                          model.toLowerCase().includes('deepseek') ? 'deepseek-reasoner' :
                          model.toLowerCase().includes('gemini') ? 'gemini-2.5-flash' : 
                          'gemini-2.5-flash';
  
  const config = MODEL_CONFIG[normalizedModel as keyof typeof MODEL_CONFIG] || MODEL_CONFIG['gemini-2.5-flash'];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "bg-gradient-to-r text-white shadow-sm",
        config.gradient,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </motion.div>
  );
}

// Compact inline version for tables
export function ModelBadgeInline({ model }: { model: string }) {
  const isGPT5 = model.toLowerCase().includes('gpt');
  const isDeepseek = model.toLowerCase().includes('deepseek');
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded",
      isGPT5 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
      isDeepseek ? "bg-blue-600/10 text-blue-600 dark:text-blue-400" :
      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
    )}>
      {isGPT5 ? <FileText className="w-3 h-3" /> : 
       isDeepseek ? <Calculator className="w-3 h-3" /> : 
       <Sparkles className="w-3 h-3" />}
      {isGPT5 ? 'GPT-5' : isDeepseek ? 'Deepseek' : 'Gemini'}
    </span>
  );
}
