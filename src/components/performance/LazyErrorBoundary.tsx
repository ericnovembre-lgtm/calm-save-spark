import React, { Component, ReactNode, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackHeight?: string;
  componentName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  background?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * LazyErrorBoundary - Enhanced error boundary specifically for lazy-loaded components
 * Features:
 * - Automatic retry with exponential backoff
 * - Custom fallback UI with component name
 * - Loading skeleton while retrying
 * - Manual retry button
 * - Error logging callback
 */
class LazyErrorBoundary extends Component<LazyErrorBoundaryProps, State> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // Base delay in ms

  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, componentName } = this.props;
    const { retryCount } = this.state;

    console.error(`[LazyErrorBoundary] Error in ${componentName || 'component'}:`, error, errorInfo);

    // Call optional error callback
    if (onError) {
      onError(error, errorInfo);
    }

    // Check if this is a chunk loading error
    const isChunkError = 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module');

    // Auto-retry for chunk errors with exponential backoff
    if (isChunkError && retryCount < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, retryCount);
      
      if (import.meta.env.DEV) {
        console.log(`[LazyErrorBoundary] Auto-retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
      }

      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, fallbackHeight = '200px', componentName, background } = this.props;

    if (hasError && error) {
      // If custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // For background components, use minimal non-blocking fallback
      if (background) {
        return (
          <div 
            className="pointer-events-none relative -z-10" 
            style={{ minHeight: fallbackHeight }}
            aria-hidden="true"
          />
        );
      }

      // Check if it's a chunk loading error
      const isChunkError = 
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed') ||
        error.message.includes('error loading dynamically imported module');

      // Show loading skeleton while auto-retrying
      if (isChunkError && retryCount < this.maxRetries) {
        return (
          <div className="space-y-4" style={{ minHeight: fallbackHeight }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading {componentName || 'component'}... (retry {retryCount + 1}/{this.maxRetries})</span>
            </div>
            <Skeleton className="w-full" style={{ height: fallbackHeight }} />
          </div>
        );
      }

      // Show error UI if max retries exceeded or non-chunk error
      return (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive" />
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {isChunkError 
                  ? 'Failed to Load Component' 
                  : `Error Loading ${componentName || 'Component'}`}
              </h3>
              
              <p className="text-sm text-muted-foreground max-w-md">
                {isChunkError
                  ? 'This component failed to load after multiple attempts. This may be due to a network issue or outdated cached files.'
                  : 'An unexpected error occurred while loading this component.'}
              </p>

              {import.meta.env.DEV && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                    {error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={this.handleRetry}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              {isChunkError && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              )}
            </div>

            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Retry attempts: {retryCount}/{this.maxRetries}
              </p>
            )}
          </div>
        </Card>
      );
    }

    // Wrap children in Suspense with skeleton fallback
    return (
      <Suspense 
        fallback={
          <Skeleton 
            className="w-full animate-pulse" 
            style={{ height: fallbackHeight }}
          />
        }
      >
        {children}
      </Suspense>
    );
  }
}

export default LazyErrorBoundary;
