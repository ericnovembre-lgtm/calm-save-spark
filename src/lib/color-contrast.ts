/**
 * Color Contrast Utilities
 * WCAG 2.1 compliant contrast ratio calculations
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

// Convert hex to RGB
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Parse CSS color string to RGB
export function parseColor(color: string): RGB | null {
  // Handle hex
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // Handle rgb(r, g, b)
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle hsl(h, s%, l%)
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1]),
      parseInt(hslMatch[2]),
      parseInt(hslMatch[3])
    );
  }

  return null;
}

// Calculate relative luminance
export function getLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check contrast compliance
export function checkContrast(
  foreground: string,
  background: string
): ContrastResult | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);

  if (!fg || !bg) return null;

  const ratio = getContrastRatio(fg, bg);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5, // Normal text
    passesAAA: ratio >= 7, // Enhanced
    passesAALarge: ratio >= 3, // Large text (18pt+)
    passesAAALarge: ratio >= 4.5, // Enhanced large text
  };
}

// Suggest accessible color alternatives
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);

  if (!fg || !bg) return null;

  const bgLuminance = getLuminance(bg);
  const needsDarker = bgLuminance > 0.5;

  // Adjust the foreground color
  let adjusted = { ...fg };
  for (let i = 0; i < 100; i++) {
    const ratio = getContrastRatio(adjusted, bg);
    if (ratio >= targetRatio) {
      return `rgb(${adjusted.r}, ${adjusted.g}, ${adjusted.b})`;
    }

    if (needsDarker) {
      adjusted.r = Math.max(0, adjusted.r - 5);
      adjusted.g = Math.max(0, adjusted.g - 5);
      adjusted.b = Math.max(0, adjusted.b - 5);
    } else {
      adjusted.r = Math.min(255, adjusted.r + 5);
      adjusted.g = Math.min(255, adjusted.g + 5);
      adjusted.b = Math.min(255, adjusted.b + 5);
    }
  }

  return null;
}

// Get contrast rating label
export function getContrastRating(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

// Check if color is light or dark
export function isLightColor(color: string): boolean {
  const rgb = parseColor(color);
  if (!rgb) return true;
  return getLuminance(rgb) > 0.5;
}
