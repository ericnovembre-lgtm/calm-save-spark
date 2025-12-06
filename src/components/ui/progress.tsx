import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Gradient variants for enhanced progress bars
const gradientVariants = {
  emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
  violet: 'bg-gradient-to-r from-violet-500 to-purple-400',
  default: 'bg-gradient-to-r from-primary to-primary/80',
} as const;

const glowVariants = {
  emerald: '0 0 12px rgba(16,185,129,0.4)',
  blue: '0 0 12px rgba(59,130,246,0.4)',
  violet: '0 0 12px rgba(139,92,246,0.4)',
  default: '0 0 12px hsl(var(--primary)/0.3)',
} as const;

interface ProgressEnhancedProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: keyof typeof gradientVariants;
  showGlow?: boolean;
}

const ProgressEnhanced = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressEnhancedProps
>(({ className, value, variant = 'default', showGlow = true, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/50", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-500 rounded-full",
        gradientVariants[variant]
      )}
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        boxShadow: showGlow ? glowVariants[variant] : undefined
      }}
    />
  </ProgressPrimitive.Root>
));
ProgressEnhanced.displayName = "ProgressEnhanced";

export { Progress, ProgressEnhanced };
