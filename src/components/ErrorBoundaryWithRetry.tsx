/**
 * Error Boundary with Retry Logic
 * Handles lazy chunk loading failures with user-friendly retry mechanism
 */

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundaryWithRetry extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Check if this is a chunk loading error (lazy import failure)
    const isChunkError = 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError');

    // Auto-retry chunk loading errors (up to maxRetries)
    if (isChunkError && this.state.retryCount < this.maxRetries) {
      console.log(`Auto-retrying chunk load (attempt ${this.state.retryCount + 1}/${this.maxRetries})...`);
      
      this.retryTimeout = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1,
        }));
      }, 1000 * (this.state.retryCount + 1)); // Exponential backoff
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleReset = () => {
    // Clear error state and retry count
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });

    // Call optional reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    // Hard reload the page to clear any cached chunks
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError = 
        this.state.error?.message.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message.includes('Loading chunk') ||
        this.state.error?.message.includes('ChunkLoadError');

      // Default error UI with retry options
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-xl font-semibold">
                {isChunkError ? 'Loading Error' : 'Something went wrong'}
              </h2>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {isChunkError ? (
                <>
                  <p>
                    We're having trouble loading this page. This usually happens when:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Your internet connection is unstable</li>
                    <li>The app was recently updated</li>
                    <li>Your browser cache needs clearing</li>
                  </ul>
                </>
              ) : (
                <p>
                  An unexpected error occurred. Don't worry, your data is safe.
                </p>
              )}

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded-md text-xs">
                  <summary className="cursor-pointer font-medium">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 whitespace-pre-wrap break-words text-[10px]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button 
                onClick={this.handleReset}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              {isChunkError && (
                <Button 
                  onClick={this.handleReload}
                  className="w-full"
                  variant="outline"
                >
                  Reload Page
                </Button>
              )}

              {this.state.retryCount > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Auto-retry attempt {this.state.retryCount} of {this.maxRetries}
                </p>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
