import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const SubscriptionList = () => {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['detected_subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('detected_subscriptions')
        .select('*')
        .order('next_expected_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('detected_subscriptions')
        .update({ is_confirmed: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detected_subscriptions'] });
      toast.success('Subscription confirmed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('detected_subscriptions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detected_subscriptions'] });
      toast.success('Subscription removed');
    },
  });

  if (isLoading) return <LoadingState />;

  const totalMonthly = subscriptions
    ?.filter(s => s.frequency === 'monthly' && s.is_confirmed)
    .reduce((sum, s) => sum + parseFloat(String(s.amount)), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Monthly Subscriptions</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              ${totalMonthly.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-semibold text-accent">
              {subscriptions?.filter(s => s.is_confirmed).length || 0}
            </p>
          </div>
        </div>
      </div>

      {subscriptions?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No subscriptions detected yet</p>
          <p className="text-sm mt-2">Add transactions to detect recurring payments</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subscriptions?.map((sub) => (
            <div
              key={sub.id}
              className="bg-card rounded-lg p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{sub.merchant}</h3>
                    <Badge variant={sub.is_confirmed ? "default" : "secondary"}>
                      {sub.is_confirmed ? 'Confirmed' : 'Detected'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {sub.frequency}
                    </Badge>
                  </div>
                  
                  {sub.next_expected_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-3 h-3" />
                      Next charge: {format(new Date(sub.next_expected_date), 'MMM dd, yyyy')}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {!sub.is_confirmed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmMutation.mutate(sub.id)}
                        disabled={confirmMutation.isPending}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Confirm
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(sub.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    ${parseFloat(String(sub.amount)).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">per {sub.frequency?.slice(0, -2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
