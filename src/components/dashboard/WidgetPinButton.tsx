import { motion } from 'framer-motion';
import { Pin, PinOff, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWidgetPreferences } from '@/hooks/useWidgetPreferences';
import { useWidgetAnalytics } from '@/hooks/useWidgetAnalytics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pinIndicatorVariants } from '@/lib/widget-animation-variants';
import { cn } from '@/lib/utils';

interface WidgetPinButtonProps {
  widgetId: string;
  className?: string;
  showHideOption?: boolean;
}

export function WidgetPinButton({ 
  widgetId, 
  className,
  showHideOption = true 
}: WidgetPinButtonProps) {
  const { isPinned, togglePin, toggleHide, isSaving } = useWidgetPreferences();
  const { trackPin, trackHide } = useWidgetAnalytics();
  const prefersReducedMotion = useReducedMotion();
  const pinned = isPinned(widgetId);

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackPin(widgetId, !pinned);
    togglePin(widgetId);
  };

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackHide(widgetId);
    toggleHide(widgetId);
  };

  if (!showHideOption) {
    return (
      <motion.button
        onClick={handlePin}
        disabled={isSaving}
        variants={prefersReducedMotion ? undefined : pinIndicatorVariants}
        animate={pinned ? 'pinned' : 'unpinned'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          'hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/50',
          pinned && 'text-amber-500',
          className
        )}
        aria-label={pinned ? 'Unpin widget' : 'Pin widget'}
        title={pinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
      >
        {pinned ? (
          <Pin className="w-4 h-4 fill-current" />
        ) : (
          <Pin className="w-4 h-4" />
        )}
      </motion.button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          variants={prefersReducedMotion ? undefined : pinIndicatorVariants}
          animate={pinned ? 'pinned' : 'unpinned'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/50',
            pinned && 'text-amber-500',
            className
          )}
          aria-label="Widget options"
        >
          {pinned ? (
            <Pin className="w-4 h-4 fill-current" />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handlePin} disabled={isSaving}>
          {pinned ? (
            <>
              <PinOff className="w-4 h-4 mr-2" />
              Unpin widget
            </>
          ) : (
            <>
              <Pin className="w-4 h-4 mr-2" />
              Pin widget
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleHide} disabled={isSaving}>
          <EyeOff className="w-4 h-4 mr-2" />
          Hide widget
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Indicator badge for pinned status
export function PinnedIndicator({ isPinned }: { isPinned: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  if (!isPinned) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background"
      title="Pinned widget"
    />
  );
}
