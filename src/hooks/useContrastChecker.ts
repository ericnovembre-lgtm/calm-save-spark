import { useState, useCallback, useMemo } from 'react';
import {
  checkContrast,
  suggestAccessibleColor,
  getContrastRating,
} from '@/lib/color-contrast';

type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

interface ContrastResult {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  level: WCAGLevel;
}

interface UseContrastCheckerOptions {
  /** Initial foreground color (CSS color string) */
  initialForeground?: string;
  /** Initial background color (CSS color string) */
  initialBackground?: string;
  /** Whether text is large (14pt bold or 18pt regular) */
  isLargeText?: boolean;
}

interface UseContrastCheckerReturn {
  /** Current foreground color */
  foreground: string;
  /** Current background color */
  background: string;
  /** Set foreground color */
  setForeground: (color: string) => void;
  /** Set background color */
  setBackground: (color: string) => void;
  /** Contrast ratio between colors */
  contrastRatio: number;
  /** Whether colors meet WCAG AA */
  meetsAA: boolean;
  /** Whether colors meet WCAG AAA */
  meetsAAA: boolean;
  /** WCAG compliance level */
  wcagLevel: WCAGLevel;
  /** Suggested accessible foreground color */
  suggestedForeground: string | null;
  /** Suggested accessible background color */
  suggestedBackground: string | null;
  /** Full contrast result object */
  result: ContrastResult;
  /** Swap foreground and background colors */
  swapColors: () => void;
  /** Reset to initial colors */
  reset: () => void;
}

/**
 * Hook for real-time color contrast checking with WCAG compliance.
 */
export function useContrastChecker({
  initialForeground = '#000000',
  initialBackground = '#ffffff',
  isLargeText = false,
}: UseContrastCheckerOptions = {}): UseContrastCheckerReturn {
  const [foreground, setForeground] = useState(initialForeground);
  const [background, setBackground] = useState(initialBackground);

  const contrastData = useMemo(() => {
    try {
      return checkContrast(foreground, background);
    } catch {
      return null;
    }
  }, [foreground, background]);

  const contrastRatio = contrastData?.ratio ?? 1;

  const meetsAA = useMemo(() => {
    if (!contrastData) return false;
    return isLargeText ? contrastData.passesAALarge : contrastData.passesAA;
  }, [contrastData, isLargeText]);

  const meetsAAA = useMemo(() => {
    if (!contrastData) return false;
    return isLargeText ? contrastData.passesAAALarge : contrastData.passesAAA;
  }, [contrastData, isLargeText]);

  const wcagLevel = useMemo((): WCAGLevel => {
    return getContrastRating(contrastRatio) as WCAGLevel;
  }, [contrastRatio]);

  const suggestedForeground = useMemo(() => {
    if (meetsAA) return null;
    try {
      const targetRatio = isLargeText ? 3 : 4.5;
      return suggestAccessibleColor(foreground, background, targetRatio);
    } catch {
      return null;
    }
  }, [foreground, background, meetsAA, isLargeText]);

  const suggestedBackground = useMemo(() => {
    if (meetsAA) return null;
    try {
      const targetRatio = isLargeText ? 3 : 4.5;
      return suggestAccessibleColor(background, foreground, targetRatio);
    } catch {
      return null;
    }
  }, [foreground, background, meetsAA, isLargeText]);

  const result: ContrastResult = useMemo(() => ({
    ratio: contrastRatio,
    meetsAA,
    meetsAAA,
    level: wcagLevel,
  }), [contrastRatio, meetsAA, meetsAAA, wcagLevel]);

  const swapColors = useCallback(() => {
    setForeground(background);
    setBackground(foreground);
  }, [foreground, background]);

  const reset = useCallback(() => {
    setForeground(initialForeground);
    setBackground(initialBackground);
  }, [initialForeground, initialBackground]);

  return {
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
    result,
    swapColors,
    reset,
  };
}
