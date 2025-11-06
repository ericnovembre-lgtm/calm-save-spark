import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div 
      className={cn(
        "relative rounded-md bg-muted",
        prefersReducedMotion 
          ? "animate-pulse" 
          : [
              "overflow-hidden",
              "before:absolute before:inset-0",
              "before:-translate-x-full",
              "before:animate-[shimmer_2s_infinite]",
              "before:bg-gradient-to-r",
              "before:from-transparent before:via-white/10 before:to-transparent",
              "dark:before:via-white/5",
            ],
        className
      )} 
      {...props} 
    />
  );
}

export { Skeleton };
