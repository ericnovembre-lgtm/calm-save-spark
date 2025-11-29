import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const categoryColors: Record<string, string> = {
  ai: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  gamification: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  social: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  analytics: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  security: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  default: 'bg-primary/10 text-primary border-primary/20',
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
  const colorClass = categoryColors[category] || categoryColors.default;

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
              colorClass
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-1">
                {title}
              </h4>
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
