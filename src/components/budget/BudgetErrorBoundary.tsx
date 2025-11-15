import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useNavigate } from 'react-router-dom';

interface BudgetErrorFallbackProps {
  error?: Error;
}

function BudgetErrorFallback({ error }: BudgetErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 backdrop-blur-sm bg-card/80 border-border/50">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Budget Loading Error
          </h2>
          <p className="text-muted-foreground text-sm">
            We couldn't load your budget data. This might be a temporary issue.
          </p>
        </div>

        {error && process.env.NODE_ENV === 'development' && (
          <Card className="p-3 bg-muted text-left">
            <p className="text-xs font-mono text-destructive break-all">
              {error.toString()}
            </p>
          </Card>
        )}

        <div className="flex gap-3 justify-center">
          <Button 
            onClick={() => window.location.reload()}
            variant="default"
          >
            Try Again
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface BudgetErrorBoundaryProps {
  children: React.ReactNode;
}

export function BudgetErrorBoundary({ children }: BudgetErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<BudgetErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}
