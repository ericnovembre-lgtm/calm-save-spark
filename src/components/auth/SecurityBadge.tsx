import { Shield, Lock, CheckCircle2 } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 md:gap-4 px-4 py-3 bg-accent/50 rounded-lg border border-border">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <Lock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span>256-bit encryption</span>
      </div>
      <div className="hidden md:block h-4 w-px bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <Shield className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span>Bank-level security</span>
      </div>
      <div className="hidden md:block h-4 w-px bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span>FDIC insured</span>
      </div>
    </div>
  );
}
