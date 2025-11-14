import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  tooltip?: string;
  action?: React.ReactNode;
}

/**
 * Consistent Section Header Component
 * Standardized spacing, icon placement, and optional tooltips
 */
export function SectionHeader({
  icon: Icon,
  title,
  description,
  tooltip,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3 flex-1">
        {/* Icon */}
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>

        {/* Title & Description */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {title}
            </h2>

            {/* Optional Tooltip */}
            {tooltip && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex items-center justify-center touch-target-comfortable rounded-full hover:bg-muted/50 transition-colors"
                      aria-label="More information"
                    >
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Optional Action */}
        {action && <div className="ml-auto">{action}</div>}
      </div>
    </div>
  );
}