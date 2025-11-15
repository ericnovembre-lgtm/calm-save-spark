import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed() {
  const { data: actions } = useQuery({
    queryKey: ['agent-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_actions')
        .select('*, agent_delegations(autonomous_agents(*))')
        .order('executed_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      {actions && actions.length > 0 ? (
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium capitalize">{action.action_type.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(action.executed_at), { addSuffix: true })}
                  </p>
                </div>
                <span className={action.success ? 'text-success' : 'text-destructive'}>
                  {action.success ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No agent activity yet</p>
      )}
    </Card>
  );
}
