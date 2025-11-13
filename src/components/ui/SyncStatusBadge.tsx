import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface SyncStatusBadgeProps {
  lastSynced: string | null;
  isSyncing?: boolean;
  syncType?: string;
}

export const SyncStatusBadge = ({ lastSynced, isSyncing, syncType = "data" }: SyncStatusBadgeProps) => {
  if (isSyncing) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Loader2 className="w-3 h-3 animate-spin" />
        Syncing...
      </Badge>
    );
  }

  if (!lastSynced) {
    return (
      <Badge variant="outline" className="gap-1.5 text-muted-foreground">
        <Clock className="w-3 h-3" />
        Never synced
      </Badge>
    );
  }

  const syncDate = new Date(lastSynced);
  const hoursSinceSync = (Date.now() - syncDate.getTime()) / (1000 * 60 * 60);
  const relativeTime = formatDistanceToNow(syncDate, { addSuffix: true });

  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let icon = <CheckCircle className="w-3 h-3" />;
  let colorClass = "text-green-600 dark:text-green-400";

  if (hoursSinceSync > 6) {
    variant = "destructive";
    icon = <AlertCircle className="w-3 h-3" />;
    colorClass = "text-red-600 dark:text-red-400";
  } else if (hoursSinceSync > 2) {
    variant = "secondary";
    icon = <Clock className="w-3 h-3" />;
    colorClass = "text-yellow-600 dark:text-yellow-400";
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant={variant} className={`gap-1.5 ${colorClass}`}>
          {icon}
          {relativeTime}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Last {syncType} sync</p>
        <p className="text-xs font-mono">{syncDate.toLocaleString()}</p>
        {hoursSinceSync > 2 && (
          <p className="text-xs text-muted-foreground mt-1">
            {hoursSinceSync > 6 ? 'Sync overdue' : 'Sync recommended'}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
