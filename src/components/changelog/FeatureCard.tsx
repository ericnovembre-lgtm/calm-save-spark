import { motion } from 'framer-motion';
import { ArrowRight, Brain, Gamepad2, BarChart3, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tourStep?: string;
  category?: string;
  index: number;
  onTryFeature?: (tourStep: string) => void;
}

const categoryConfig: Record<string, { 
  label: string; 
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  ai: {
    label: 'AI',
    icon: Brain,
    bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/20',
  },
  gamification: {
    label: 'Gamification',
    icon: Gamepad2,
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/20',
  },
  analytics: {
    label: 'Analytics',
    icon: BarChart3,
    bgClass: 'bg-green-500/10 dark:bg-green-500/20',
    textClass: 'text-green-600 dark:text-green-400',
    borderClass: 'border-green-500/20',
  },
  default: {
    label: 'Feature',
    icon: Tag,
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    borderClass: 'border-primary/20',
  },
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
  tourStep,
  category = 'default',
  index,
  onTryFeature,
}: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = categoryConfig[category] || categoryConfig.default;
  const CategoryIcon = config.icon;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.4,
        delay: prefersReducedMotion ? 0 : index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card className="bg-card/50 hover:bg-card/80 transition-colors border-border/50 hover:border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2.5 rounded-xl shrink-0 border",
              config.bgClass,
              config.textClass,
              config.borderClass
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="font-medium text-foreground">
                  {title}
                </h4>
                {category !== 'default' && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-5 font-medium gap-1",
                      config.bgClass,
                      config.textClass,
                      config.borderClass
                    )}
                  >
                    <CategoryIcon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            {tourStep && onTryFeature && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTryFeature(tourStep)}
                className="shrink-0 text-primary hover:text-primary hover:bg-primary/10"
              >
                Try it
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
