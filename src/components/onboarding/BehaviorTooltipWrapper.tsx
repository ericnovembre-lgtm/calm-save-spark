/**
 * Wrapper component for form fields with behavior-triggered tooltips
 */

import { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBehaviorTooltip } from '@/hooks/useBehaviorTooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface BehaviorTooltipWrapperProps {
  /** The form field to wrap */
  children: ReactNode;
  /** Help text to show in the tooltip */
  helpText: string;
  /** Unique field identifier for analytics */
  fieldName: string;
  /** Optional callback when tooltip is shown */
  onTooltipShown?: () => void;
  /** Delay before showing tooltip in ms (default: 5000) */
  delay?: number;
}

export const BehaviorTooltipWrapper = ({
  children,
  helpText,
  fieldName,
  onTooltipShown,
  delay = 5000,
}: BehaviorTooltipWrapperProps) => {
  const { showTooltip, tooltipProps } = useBehaviorTooltip(helpText, { delay });

  // Notify parent when tooltip is shown
  if (showTooltip && onTooltipShown) {
    onTooltipShown();
  }

  return (
    <div className="relative">
      <TooltipProvider delayDuration={0}>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <div {...tooltipProps}>
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="start"
            className="max-w-xs"
            sideOffset={8}
          >
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-start gap-2"
                >
                  <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Need help?</p>
                    <p className="text-muted-foreground">{helpText}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
