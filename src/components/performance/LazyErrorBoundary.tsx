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
  timeoutMs?: number;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  hasTimedOut: boolean;
  recoveryAttempts: number;
  lastRecoveryTime: number | null;
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
  private loadingTimeout: NodeJS.Timeout | null = null;
  private loadStartTime: number = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // Base delay in ms

  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      hasTimedOut: false,
      recoveryAttempts: 0,
      lastRecoveryTime: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidMount() {
    const { timeoutMs = 5000, componentName, onLoadStart } = this.props;
    this.loadStartTime = Date.now();
    
    console.log(`[LazyErrorBoundary] ${componentName} loading started`);
    onLoadStart?.();

    // Set timeout to detect indefinite loading
    this.loadingTimeout = setTimeout(() => {
      const loadDuration = Date.now() - this.loadStartTime;
      console.warn(`[LazyErrorBoundary] ${componentName} loading timeout after ${loadDuration}ms`);
      
      this.setState({ hasTimedOut: true });

      // Track timeout event
      if (typeof window !== 'undefined' && (window as any).saveplus_audit_event) {
        (window as any).saveplus_audit_event('component_timeout', {
          component: componentName,
          timeout_ms: timeoutMs,
          load_duration_ms: loadDuration
        });
      }
    }, timeoutMs);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, componentName } = this.props;
    const { retryCount } = this.state;
    const loadDuration = Date.now() - this.loadStartTime;

    // Clear loading timeout if it exists
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    // Check if this is a chunk loading error
    const isChunkError = 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module');

    // Detailed error log
    const errorLog = {
      component: componentName || 'unknown',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      retryCount,
      isChunkError,
      loadDuration,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      connectionSpeed: (navigator as any).connection?.effectiveType || 'unknown'
    };

    console.error(`[LazyErrorBoundary] Error details:`, errorLog);

    // Track error event
    if (typeof window !== 'undefined' && (window as any).saveplus_audit_event) {
      (window as any).saveplus_audit_event('component_error', errorLog);
    }

    // Call optional error callback
    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-retry for chunk errors with exponential backoff
    if (isChunkError && retryCount < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, retryCount);
      
      if (import.meta.env.DEV) {
        console.log(`[LazyErrorBoundary] Auto-retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
      }

      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, delay);
    } else if (retryCount >= this.maxRetries) {
      console.error(`[LazyErrorBoundary] Max retries (${this.maxRetries}) reached for ${componentName}`);
    }
  }

  componentDidUpdate(prevProps: LazyErrorBoundaryProps, prevState: State) {
    // Detect successful load
    if (prevState.hasError && !this.state.hasError) {
      const loadDuration = Date.now() - this.loadStartTime;
      console.log(`[LazyErrorBoundary] ${this.props.componentName} loaded successfully after ${loadDuration}ms`);
      this.props.onLoadComplete?.();

      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }

  handleRetry = () => {
    const now = Date.now();
    const timeSinceLastRecovery = this.state.lastRecoveryTime 
      ? now - this.state.lastRecoveryTime 
      : 0;

    console.log(`[LazyErrorBoundary] Manual retry for ${this.props.componentName}`, {
      retryCount: this.state.retryCount + 1,
      recoveryAttempts: this.state.recoveryAttempts + 1,
      timeSinceLastRecovery
    });

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: 0,
      hasTimedOut: false,
      recoveryAttempts: prevState.recoveryAttempts + 1,
      lastRecoveryTime: now,
    }));

    this.loadStartTime = Date.now();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, retryCount, hasTimedOut } = this.state;
    const { children, fallback, fallbackHeight = '200px', componentName, background } = this.props;

    // Handle timeout state
    if (hasTimedOut && !hasError) {
      if (background) {
        return (
          <div 
            className="pointer-events-none relative" 
            style={{ minHeight: fallbackHeight, zIndex: 'var(--z-background)' }}
            aria-hidden="true"
          />
        );
      }

      return (
        <div className="p-4 border border-border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground mb-2">Taking longer than expected...</p>
          <Button size="sm" variant="outline" onClick={this.handleRetry}>
            Retry
          </Button>
        </div>
      );
    }

    if (hasError && error) {
      // If custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // For background components, use minimal non-blocking fallback
      if (background) {
        return (
          <div 
            className="pointer-events-none relative" 
            style={{ minHeight: fallbackHeight, zIndex: 'var(--z-background)' }}
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
