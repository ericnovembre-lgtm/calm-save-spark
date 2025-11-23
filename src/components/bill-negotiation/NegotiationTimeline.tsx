import { TimelineEntry } from "./TimelineEntry";
import { FileText } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

interface NegotiationTimelineProps {
  requests: any[];
}

export function NegotiationTimeline({ requests }: NegotiationTimelineProps) {
  const sortedRequests = [...requests].sort((a, b) => 
    new Date(b.completed_at || b.requested_at).getTime() - 
    new Date(a.completed_at || a.requested_at).getTime()
  );

  if (sortedRequests.length === 0) {
    return (
      <GlassPanel className="p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary/20 border border-secondary mx-auto flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Negotiation History Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your completed negotiations will appear here. Start by analyzing bills or requesting negotiations.
        </p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-0">
      {sortedRequests.map((request, index) => (
        <TimelineEntry
          key={request.id}
          merchant={request.merchant}
          beforeAmount={Number(request.current_amount)}
          afterAmount={request.result_amount ? Number(request.result_amount) : null}
          savings={request.actual_savings ? Number(request.actual_savings) : null}
          requestedAt={request.requested_at}
          completedAt={request.completed_at}
          status={request.status}
          notes={request.notes}
          isLast={index === sortedRequests.length - 1}
        />
      ))}
    </div>
  );
}