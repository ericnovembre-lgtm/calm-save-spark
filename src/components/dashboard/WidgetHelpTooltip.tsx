import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, ExternalLink, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface WidgetHelpContent {
  title: string;
  description: string;
  tips?: string[];
  learnMoreUrl?: string;
}

interface WidgetHelpTooltipProps {
  children: ReactNode;
  content: WidgetHelpContent;
  className?: string;
  position?: 'top-right' | 'top-left';
}

/**
 * WidgetHelpTooltip
 * Wraps a widget and adds a contextual help icon with glass-morphic tooltip
 */
export function WidgetHelpTooltip({
  children,
  content,
  className,
  position = 'top-right',
}: WidgetHelpTooltipProps) {
  return (
    <div className={cn('relative group', className)}>
      {children}
      
      {/* Help icon */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className={cn(
                'absolute z-10 p-1.5 rounded-full',
                'bg-background/80 backdrop-blur-sm border border-border/50',
                'text-muted-foreground hover:text-foreground hover:bg-background',
                'transition-all shadow-sm',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                position === 'top-right' && 'top-2 right-2',
                position === 'top-left' && 'top-2 left-2'
              )}
              aria-label={`Help: ${content.title}`}
            >
              <HelpCircle className="w-4 h-4" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            align="start"
            className={cn(
              'max-w-xs p-0 overflow-hidden',
              'bg-popover/95 backdrop-blur-xl border-border/50',
              'shadow-xl'
            )}
            sideOffset={8}
          >
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {content.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {content.description}
                  </p>
                </div>
              </div>

              {/* Tips */}
              {content.tips && content.tips.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pro Tips
                  </p>
                  <ul className="space-y-1">
                    {content.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learn more link */}
              {content.learnMoreUrl && (
                <a
                  href={content.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-1 text-xs text-primary hover:underline',
                    'pt-2 border-t border-border/50'
                  )}
                >
                  Learn more
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
