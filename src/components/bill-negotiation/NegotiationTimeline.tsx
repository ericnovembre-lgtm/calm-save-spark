import { TimelineEntry } from "./TimelineEntry";
import { FileText } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Negotiation History</h3>
        <p className="text-muted-foreground max-w-md">
          Your completed negotiations will appear here. Start by analyzing bills or requesting negotiations in the Opportunities tab.
        </p>
      </div>
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