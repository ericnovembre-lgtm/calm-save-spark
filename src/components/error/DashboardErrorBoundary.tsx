import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for dashboard sections
 * Shows fallback UI and retry button if a section crashes
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard section error:', {
      section: this.props.sectionName,
      error: error.message,
      stack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-medium text-sm text-foreground">
                  {this.props.sectionName || 'This section'} couldn't load
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Something went wrong. Try refreshing this section.
                </p>
              </div>
              <Button
                onClick={this.handleRetry}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading skeleton for dashboard sections
 */
export function DashboardSectionSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}