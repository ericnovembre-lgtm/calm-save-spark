import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

/**
 * Container component that applies different styles based on device size
 * Implements mobile-first responsive design
 */
export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      // Base styles
      className,
      // Mobile-first
      isMobile && mobileClassName,
      // Tablet breakpoint
      "md:" + (tabletClassName || ''),
      // Desktop breakpoint
      "lg:" + (desktopClassName || '')
    )}>
      {children}
    </div>
  );
}

/**
 * Grid container with responsive columns
 */
interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className
}: ResponsiveGridProps) {
  return (
    <div className={cn(
      "grid gap-" + gap,
      `grid-cols-${cols.mobile}`,
      `md:grid-cols-${cols.tablet}`,
      `lg:grid-cols-${cols.desktop}`,
      className
    )}>
      {children}
    </div>
  );
}
