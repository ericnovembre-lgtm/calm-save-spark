/**
 * SuspenseBoundary - Unified error + loading boundary
 * Handles Suspense fallbacks with error recovery
 */
import { Suspense, ReactNode, Component, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('SuspenseBoundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleRetry);
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          onRetry={this.handleRetry} 
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ 
  error, 
  onRetry 
}: { 
  error: Error; 
  onRetry: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 bg-destructive/5 rounded-lg border border-destructive/20">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-destructive">Something went wrong</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="gap-2"
      >
        <RefreshCw className="h-3 w-3" />
        Try again
      </Button>
    </div>
  );
}

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

export function SuspenseBoundary({
  children,
  fallback,
  errorFallback,
  onError,
  className,
}: SuspenseBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={fallback || <DefaultLoadingFallback className={className} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function DefaultLoadingFallback({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

// Pre-built fallbacks for common component types
export function CardFallback({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-xl border bg-card space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function ChartFallback({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-xl border bg-card', className)}>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function ListFallback({ 
  count = 3, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WidgetFallback({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-xl glass-widget space-y-3', className)}>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}
