/**
 * Page-level Error Boundary Component
 * Catches errors in page components and displays user-friendly fallback UI
 * Reports errors to Sentry with page context
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { captureException, addBreadcrumb, Sentry } from '@/lib/sentry';

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PageErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Add breadcrumb for context
    addBreadcrumb(
      `Error caught in ${this.props.pageName}`,
      'error',
      'error',
      { componentStack: errorInfo.componentStack }
    );

    // Capture exception with page context
    const eventId = captureException(error, {
      tags: {
        page: this.props.pageName,
        errorBoundary: 'PageErrorBoundary',
      },
      extra: {
        componentStack: errorInfo.componentStack,
        pageName: this.props.pageName,
      },
      level: 'error',
    });

    this.setState({ 
      errorInfo,
      eventId: eventId || null,
    });

    console.error(`[PageErrorBoundary] Error in ${this.props.pageName}:`, error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoBack = (): void => {
    window.history.back();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
    this.props.onReset?.();
  };

  handleReportIssue = (): void => {
    // Use Sentry's feedback dialog if available
    if (this.state.eventId && Sentry.showReportDialog) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an error while loading {this.props.pageName}. 
                Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error details (collapsed by default in production) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-32">
                  <p className="text-destructive font-semibold">{this.state.error.message}</p>
                  <p className="text-muted-foreground mt-1">{this.state.error.stack?.slice(0, 200)}...</p>
                </div>
              )}

              {/* Event ID for support reference */}
              {this.state.eventId && (
                <p className="text-xs text-muted-foreground text-center">
                  Reference: <code className="bg-muted px-1 py-0.5 rounded">{this.state.eventId.slice(0, 8)}</code>
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={this.handleGoBack} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  {this.state.eventId && (
                    <Button variant="outline" onClick={this.handleReportIssue} className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
