import { Sparkles } from 'lucide-react';

export function DashboardFooter() {
  return (
    <footer className="border-t border-border/50 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          Dashboard personalized by Claude Opus 4.5
        </p>
      </div>
    </footer>
  );
}
