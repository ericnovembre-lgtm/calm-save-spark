/**
 * ForceLightMode - Wrapper to enforce light theme on dashboard
 * Overrides dark mode CSS variables to ensure warm off-white appearance
 */

import { ReactNode } from "react";

interface ForceLightModeProps {
  children: ReactNode;
}

export function ForceLightMode({ children }: ForceLightModeProps) {
  return (
    <div 
      className="force-light-mode"
      style={{
        // Force light mode CSS variables inline
        '--background': '40 25% 96%',
        '--foreground': '40 10% 10%',
        '--card': '0 0% 100%',
        '--card-foreground': '40 10% 10%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '40 10% 10%',
        '--primary': '38 45% 50%',
        '--primary-foreground': '0 0% 100%',
        '--secondary': '40 20% 92%',
        '--secondary-foreground': '40 10% 20%',
        '--muted': '40 15% 90%',
        '--muted-foreground': '40 10% 45%',
        '--accent': '38 45% 68%',
        '--accent-foreground': '40 10% 10%',
        '--border': '40 15% 85%',
        '--input': '40 15% 85%',
        '--ring': '38 45% 50%',
        colorScheme: 'light',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
