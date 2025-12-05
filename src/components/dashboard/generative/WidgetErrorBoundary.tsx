import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  widgetId: string;
  widgetType?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for individual dashboard widgets.
 * Prevents single widget failures from crashing the entire dashboard.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[WidgetErrorBoundary] Widget "${this.props.widgetId}" crashed:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      widgetType: this.props.widgetType
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-4 bg-destructive/5 border-destructive/20 h-full flex flex-col items-center justify-center gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive/60" />
          <div className="text-center">
            <p className="text-sm font-medium text-destructive/80">Widget Error</p>
            <p className="text-xs text-muted-foreground mt-1">
              {this.props.widgetType || 'This widget'} failed to load
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Compact error fallback for smaller widgets
 */
export const CompactWidgetError = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg flex items-center gap-2">
    <AlertTriangle className="h-4 w-4 text-destructive/60 shrink-0" />
    <span className="text-xs text-muted-foreground flex-1">Failed to load</span>
    {onRetry && (
      <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 px-2">
        <RefreshCw className="h-3 w-3" />
      </Button>
    )}
  </div>
);

export default WidgetErrorBoundary;
