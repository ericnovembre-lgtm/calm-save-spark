import { AppLayout } from "@/components/layout/AppLayout";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Subscriptions() {
  const queryClient = useQueryClient();

  const detectMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Detection failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['detected_subscriptions'] });
      toast.success(`Detected ${data.subscriptions_detected} subscriptions`);
    },
    onError: () => {
      toast.error('Failed to detect subscriptions');
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Subscriptions</h1>
            <p className="text-muted-foreground">Manage your recurring payments</p>
          </div>
          <Button 
            onClick={() => detectMutation.mutate()}
            disabled={detectMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${detectMutation.isPending ? 'animate-spin' : ''}`} />
            Detect Subscriptions
          </Button>
        </div>

        <SubscriptionList />
      </div>
    </AppLayout>
  );
}
