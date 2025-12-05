import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /** If true, content becomes visible (useful for focus states) */
  focusable?: boolean;
}

/**
 * Visually hide content while keeping it accessible to screen readers
 * Follows WCAG best practices for accessible hiding
 */
export function VisuallyHidden({
  children,
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        // Base styles that visually hide content
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        '[clip:rect(0,0,0,0)]',
        // If focusable, show on focus
        focusable && 'focus:static focus:w-auto focus:h-auto focus:p-2 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:[clip:auto]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Screen reader only text - shorthand for VisuallyHidden
 */
export function SrOnly({ children, ...props }: Omit<VisuallyHiddenProps, 'focusable'>) {
  return <VisuallyHidden {...props}>{children}</VisuallyHidden>;
}

/**
 * Focusable skip link that appears on focus
 */
export function SkipLink({
  href,
  children,
  className,
  ...props
}: { href: string; children: ReactNode } & HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default
        'absolute -top-10 left-0 z-50 p-3 bg-background text-foreground',
        'rounded-md shadow-lg border border-border',
        'transition-all duration-200',
        // Show on focus
        'focus:top-4 focus:left-4',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
