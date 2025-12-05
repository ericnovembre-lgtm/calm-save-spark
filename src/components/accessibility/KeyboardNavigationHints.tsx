import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KeyboardHint {
  key: string;
  description: string;
  element?: HTMLElement;
}

interface KeyboardNavigationHintsProps {
  /** Whether hints are visible */
  visible?: boolean;
  /** Trigger key to show hints (default: Alt) */
  triggerKey?: 'Alt' | 'Control' | 'Meta';
  /** Custom hints to display */
  hints?: KeyboardHint[];
  /** Auto-detect focusable elements */
  autoDetect?: boolean;
  /** Container to scan for focusable elements */
  containerRef?: React.RefObject<HTMLElement>;
  /** Position of hint overlay */
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  /** Additional CSS classes */
  className?: string;
}

const defaultHints: KeyboardHint[] = [
  { key: 'Tab', description: 'Move to next element' },
  { key: 'Shift+Tab', description: 'Move to previous element' },
  { key: 'Enter', description: 'Activate button or link' },
  { key: 'Space', description: 'Toggle checkbox or button' },
  { key: 'Escape', description: 'Close dialog or cancel' },
  { key: '↑↓', description: 'Navigate list items' },
  { key: 'Home', description: 'Go to first item' },
  { key: 'End', description: 'Go to last item' },
];

/**
 * Visual overlay showing keyboard navigation hints.
 * Triggered by holding a modifier key or via toggle.
 */
export function KeyboardNavigationHints({
  visible: controlledVisible,
  triggerKey = 'Alt',
  hints = defaultHints,
  autoDetect = false,
  containerRef,
  position = 'bottom-right',
  className,
}: KeyboardNavigationHintsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [detectedHints, setDetectedHints] = useState<KeyboardHint[]>([]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle trigger key press
  useEffect(() => {
    if (controlledVisible !== undefined) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === triggerKey) {
        setIsVisible(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === triggerKey) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlledVisible, triggerKey]);

  // Auto-detect focusable elements
  useEffect(() => {
    if (!autoDetect || !isVisible) return;

    const container = containerRef?.current || document.body;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const elements = container.querySelectorAll<HTMLElement>(focusableSelector);
    const detected: KeyboardHint[] = [];

    elements.forEach((el, index) => {
      const accessKey = el.accessKey;
      const ariaLabel = el.getAttribute('aria-label');
      const title = el.getAttribute('title');
      const text = el.textContent?.trim().slice(0, 30);

      if (accessKey) {
        detected.push({
          key: `Alt+${accessKey.toUpperCase()}`,
          description: ariaLabel || title || text || `Element ${index + 1}`,
          element: el,
        });
      }
    });

    setDetectedHints(detected);
  }, [autoDetect, isVisible, containerRef]);

  const showHints = controlledVisible ?? isVisible;
  const allHints = [...hints, ...detectedHints];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <AnimatePresence>
      {showHints && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'fixed z-50 p-4 rounded-lg',
            'bg-popover/95 backdrop-blur-sm border border-border shadow-lg',
            'max-w-xs w-full',
            positionClasses[position],
            className
          )}
          role="tooltip"
          aria-label="Keyboard navigation hints"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border">
              {triggerKey}
            </kbd>
            <span>Keyboard Shortcuts</span>
          </h3>

          <ul className="space-y-2">
            {allHints.map((hint, index) => (
              <li
                key={`${hint.key}-${index}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <kbd className="px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded border border-border font-mono min-w-[60px] text-center">
                  {hint.key}
                </kbd>
                <span className="text-muted-foreground text-right flex-1">
                  {hint.description}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs text-muted-foreground/70 border-t border-border pt-2">
            Release {triggerKey} to hide
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
