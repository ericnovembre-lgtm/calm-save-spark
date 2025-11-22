import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: "low" | "medium" | "high";
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, blur = "md", opacity = "medium", children, ...props }, ref) => {
    const blurClasses = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg",
      xl: "backdrop-blur-xl",
    };

    const opacityClasses = {
      low: "bg-background/10",
      medium: "bg-background/20",
      high: "bg-background/40",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/10",
          "shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]",
          blurClasses[blur],
          opacityClasses[opacity],
          "transition-all duration-300",
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
