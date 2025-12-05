import { useEffect, useState } from 'react';

type FocusStyle = 'ring' | 'glow' | 'outline' | 'both';

interface FocusIndicatorProps {
  style?: FocusStyle;
  color?: string;
  width?: number;
  offset?: number;
}

/**
 * Global focus indicator customization
 * Injects CSS variables and styles for focus visibility
 */
export function FocusIndicator({
  style = 'ring',
  color = 'hsl(var(--ring))',
  width = 2,
  offset = 2,
}: FocusIndicatorProps) {
  useEffect(() => {
    // Set CSS variables
    document.documentElement.style.setProperty('--focus-ring-color', color);
    document.documentElement.style.setProperty('--focus-ring-width', `${width}px`);
    document.documentElement.style.setProperty('--focus-ring-offset', `${offset}px`);

    // Create dynamic styles based on focus style
    const styleId = 'focus-indicator-styles';
    let existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      existingStyle = document.createElement('style');
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    let css = '';

    switch (style) {
      case 'ring':
        css = `
          :focus-visible {
            outline: none;
            box-shadow: 0 0 0 var(--focus-ring-offset) hsl(var(--background)),
                        0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--focus-ring-color);
          }
        `;
        break;

      case 'glow':
        css = `
          :focus-visible {
            outline: none;
            box-shadow: 0 0 0 var(--focus-ring-offset) hsl(var(--background)),
                        0 0 8px 4px var(--focus-ring-color),
                        0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--focus-ring-color);
          }
        `;
        break;

      case 'outline':
        css = `
          :focus-visible {
            outline: var(--focus-ring-width) solid var(--focus-ring-color);
            outline-offset: var(--focus-ring-offset);
          }
        `;
        break;

      case 'both':
        css = `
          :focus-visible {
            outline: var(--focus-ring-width) solid var(--focus-ring-color);
            outline-offset: var(--focus-ring-offset);
            box-shadow: 0 0 8px 2px var(--focus-ring-color);
          }
        `;
        break;
    }

    existingStyle.textContent = css;

    return () => {
      // Cleanup is optional - styles persist for consistent UX
    };
  }, [style, color, width, offset]);

  return null;
}

/**
 * Hook for managing focus indicator preferences
 */
export function useFocusIndicator() {
  const [settings, setSettings] = useState<FocusIndicatorProps>(() => {
    const saved = localStorage.getItem('focus-indicator-settings');
    return saved ? JSON.parse(saved) : { style: 'ring', width: 2, offset: 2 };
  });

  const updateSettings = (newSettings: Partial<FocusIndicatorProps>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('focus-indicator-settings', JSON.stringify(updated));
      return updated;
    });
  };

  return { settings, updateSettings };
}
