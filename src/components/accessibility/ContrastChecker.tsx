import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { useContrastChecker } from '@/hooks/useContrastChecker';
import { cn } from '@/lib/utils';

interface ContrastCheckerProps {
  /** Initial foreground color */
  initialForeground?: string;
  /** Initial background color */
  initialBackground?: string;
  /** Whether text is large (14pt bold or 18pt+) */
  isLargeText?: boolean;
  /** Callback when colors change */
  onColorsChange?: (foreground: string, background: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Visual color contrast checker with WCAG compliance indicators.
 */
export function ContrastChecker({
  initialForeground = '#000000',
  initialBackground = '#ffffff',
  isLargeText = false,
  onColorsChange,
  className,
}: ContrastCheckerProps) {
  const {
    foreground,
    background,
    setForeground,
    setBackground,
    contrastRatio,
    meetsAA,
    meetsAAA,
    wcagLevel,
    suggestedForeground,
    suggestedBackground,
    swapColors,
    reset,
  } = useContrastChecker({
    initialForeground,
    initialBackground,
    isLargeText,
  });

  const handleForegroundChange = (color: string) => {
    setForeground(color);
    onColorsChange?.(color, background);
  };

  const handleBackgroundChange = (color: string) => {
    setBackground(color);
    onColorsChange?.(foreground, color);
  };

  const handleSwap = () => {
    swapColors();
    onColorsChange?.(background, foreground);
  };

  const applySuggestion = (type: 'foreground' | 'background') => {
    if (type === 'foreground' && suggestedForeground) {
      handleForegroundChange(suggestedForeground);
    } else if (type === 'background' && suggestedBackground) {
      handleBackgroundChange(suggestedBackground);
    }
  };

  return (
    <div className={cn('p-4 rounded-lg border border-border bg-card', className)}>
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Color Contrast Checker
      </h3>

      {/* Color Pickers */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">
            Foreground (Text)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={foreground}
              onChange={(e) => handleForegroundChange(e.target.value)}
              className="w-10 h-10 rounded border border-border cursor-pointer"
              aria-label="Foreground color picker"
            />
            <input
              type="text"
              value={foreground}
              onChange={(e) => handleForegroundChange(e.target.value)}
              className="flex-1 px-2 py-1 text-xs font-mono bg-muted rounded border border-border"
              aria-label="Foreground color hex value"
            />
          </div>
        </div>

        <button
          onClick={handleSwap}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Swap foreground and background colors"
        >
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex-1">
          <label className="block text-xs text-muted-foreground mb-1">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background}
              onChange={(e) => handleBackgroundChange(e.target.value)}
              className="w-10 h-10 rounded border border-border cursor-pointer"
              aria-label="Background color picker"
            />
            <input
              type="text"
              value={background}
              onChange={(e) => handleBackgroundChange(e.target.value)}
              className="flex-1 px-2 py-1 text-xs font-mono bg-muted rounded border border-border"
              aria-label="Background color hex value"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className="p-4 rounded-lg mb-4 text-center"
        style={{ backgroundColor: background, color: foreground }}
      >
        <p className="text-lg font-medium">Preview Text</p>
        <p className={cn('text-sm', isLargeText && 'text-lg')}>
          {isLargeText ? 'Large text (18pt+)' : 'Normal text (14pt)'}
        </p>
      </div>

      {/* Contrast Ratio */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Contrast Ratio</p>
          <p className="text-2xl font-bold text-foreground">
            {contrastRatio.toFixed(2)}:1
          </p>
        </div>

        <div className="flex gap-2">
          <ComplianceBadge
            level="AA"
            passes={meetsAA}
            required={isLargeText ? 3 : 4.5}
          />
          <ComplianceBadge
            level="AAA"
            passes={meetsAAA}
            required={isLargeText ? 4.5 : 7}
          />
        </div>
      </div>

      {/* WCAG Level */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">WCAG Level:</span>
        <span
          className={cn(
            'px-2 py-0.5 text-xs font-semibold rounded',
            wcagLevel === 'AAA' && 'bg-emerald-500/20 text-emerald-400',
            wcagLevel === 'AA' && 'bg-amber-500/20 text-amber-400',
            wcagLevel === 'Fail' && 'bg-rose-500/20 text-rose-400'
          )}
        >
          {wcagLevel}
        </span>
      </div>

      {/* Suggestions */}
      {!meetsAA && (suggestedForeground || suggestedBackground) && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs font-medium text-foreground mb-2">
            Suggested Accessible Colors
          </p>
          <div className="flex gap-2">
            {suggestedForeground && (
              <button
                onClick={() => applySuggestion('foreground')}
                className="flex items-center gap-2 px-2 py-1 text-xs rounded bg-background border border-border hover:bg-muted transition-colors"
              >
                <span
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: suggestedForeground }}
                />
                <span>Use {suggestedForeground}</span>
              </button>
            )}
            {suggestedBackground && (
              <button
                onClick={() => applySuggestion('background')}
                className="flex items-center gap-2 px-2 py-1 text-xs rounded bg-background border border-border hover:bg-muted transition-colors"
              >
                <span
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: suggestedBackground }}
                />
                <span>Use {suggestedBackground}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={reset}
        className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reset to defaults
      </button>
    </div>
  );
}

interface ComplianceBadgeProps {
  level: 'AA' | 'AAA';
  passes: boolean;
  required: number;
}

function ComplianceBadge({ level, passes, required }: ComplianceBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
        passes
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/20 text-rose-400'
      )}
    >
      {passes ? (
        <Check className="w-3 h-3" />
      ) : (
        <X className="w-3 h-3" />
      )}
      <span>{level}</span>
      <span className="text-[10px] opacity-70">({required}:1)</span>
    </motion.div>
  );
}
