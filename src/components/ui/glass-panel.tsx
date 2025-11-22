import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: "low" | "medium" | "high";
  variant?: "default" | "strong" | "subtle";
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, blur = "md", opacity = "medium", variant = "default", children, ...props }, ref) => {
    const blurClasses = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-glass",
      lg: "backdrop-blur-lg",
      xl: "backdrop-blur-glass-strong",
    };

    const variantClasses = {
      default: "bg-glass border-glass-border shadow-glass",
      strong: "bg-glass-strong border-glass-border-strong shadow-glass-strong",
      subtle: "bg-glass-subtle border-glass-border-subtle shadow-glass-subtle",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          blurClasses[blur],
          variantClasses[variant],
          "transition-all duration-300",
          "hover:bg-glass-hover hover:border-glass-border-hover",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";
