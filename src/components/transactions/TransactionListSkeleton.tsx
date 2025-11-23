import { GlassPanel } from "@/components/ui/glass-panel";

export function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <GlassPanel key={i} className="p-4 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-muted/30" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted/30 rounded w-1/3" />
                <div className="h-3 bg-muted/20 rounded w-1/2" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-7 bg-muted/30 rounded w-24" />
              <div className="h-3 bg-muted/20 rounded w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-muted/20 rounded w-20" />
            <div className="h-6 bg-muted/20 rounded w-16" />
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
