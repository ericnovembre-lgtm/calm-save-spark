import { Shield, Lock, CheckCircle2 } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="flex items-center justify-center gap-4 px-4 py-3 bg-accent/50 rounded-lg border border-border">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>256-bit encryption</span>
      </div>
      <div className="h-4 w-px bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Bank-level security</span>
      </div>
      <div className="h-4 w-px bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span>FDIC insured</span>
      </div>
    </div>
  );
}
