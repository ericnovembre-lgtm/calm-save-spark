import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "text-base md:text-sm",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "hover:border-foreground/20 hover:shadow-[var(--shadow-soft)]",
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "focus-visible:border-foreground/30",
          "focus-visible:bg-card",
          "focus-visible:shadow-[var(--shadow-card)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-muted-foreground placeholder:transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "ring-offset-background",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
