import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TimelineNodeProps {
  version: string;
  date: string;
  featureCount: number;
  isLatest: boolean;
  isExpanded: boolean;
  index: number;
  onToggle: () => void;
}

export function TimelineNode({
  version,
  date,
  featureCount,
  isLatest,
  isExpanded,
  index,
  onToggle,
}: TimelineNodeProps) {
  const prefersReducedMotion = useReducedMotion();
  const parsedDate = new Date(date);
  const relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true });

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion ? 0 : index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Timeline dot with pulse effect for latest */}
      <div className="absolute left-0 top-2">
        <div className={cn(
          "w-4 h-4 rounded-full border-2 bg-background transition-all",
          isLatest 
            ? "border-primary bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]" 
            : "border-muted-foreground/30"
        )}>
          {isLatest && (
            <>
              <Sparkles className="w-2.5 h-2.5 text-primary-foreground absolute top-0.5 left-0.5" />
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md ml-8",
          isLatest && "border-primary/30 bg-primary/5 hover:bg-primary/10",
          isExpanded && "ring-1 ring-primary/20"
        )}
        onClick={onToggle}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                Version {version}
              </CardTitle>
              {isLatest && (
                <Badge className="bg-primary text-primary-foreground">
                  Latest
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{format(parsedDate, 'MMM d, yyyy')}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{relativeTime}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{featureCount} feature{featureCount !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
