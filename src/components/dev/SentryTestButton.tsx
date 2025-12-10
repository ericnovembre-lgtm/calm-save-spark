import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ThrowErrorButton() {
  const handleClick = () => {
    throw new Error('This is your first Sentry test error!');
  };

  return (
    <Button
      variant="destructive"
      onClick={handleClick}
      className="gap-2"
    >
      <AlertTriangle className="w-4 h-4" />
      Trigger Test Error
    </Button>
  );
}

export function SentryTestButton() {
  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
        <div>
          <h4 className="font-medium text-sm">Sentry Error Test</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Click to trigger a test error. This will be captured by Sentry.
          </p>
        </div>
      </div>
      <ErrorBoundary>
        <ThrowErrorButton />
      </ErrorBoundary>
    </div>
  );
}
