import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ReferralReview() {
  const queryClient = useQueryClient();

  const { data: referrals } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const updates: any = { status };
      
      if (status === 'rewarded') {
        updates.rewarded_at = new Date().toISOString();
        updates.reward_points = 500;
        updates.reward_amount = 10;
      }

      const { error } = await supabase
        .from('referrals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-referrals'] });
      toast.success("Referral status updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  const pendingReferrals = referrals?.filter(r => r.status === 'pending') || [];
  const completedReferrals = referrals?.filter(r => r.status !== 'pending') || [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Pending Referrals</h3>
        <div className="space-y-3">
          {pendingReferrals.length > 0 ? (
            pendingReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{referral.referred_email || 'No email provided'}</p>
                    <p className="text-sm text-muted-foreground">
                      Code: {referral.referral_code} • Created {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: referral.id, status: 'completed' })}
                  >
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStatus.mutate({ id: referral.id, status: 'rejected' })}
                  >
                    <X className="w-4 h-4 text-red-600 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No pending referrals</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Recent Referrals</h3>
        <div className="space-y-3">
          {completedReferrals.slice(0, 10).map((referral) => (
            <div key={referral.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{referral.referred_email || 'No email'}</p>
                  <p className="text-sm text-muted-foreground">
                    {referral.referral_code} • {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {referral.status === 'rewarded' && (
                  <p className="text-sm font-medium text-green-600">
                    ${parseFloat(referral.reward_amount.toString()).toFixed(0)} rewarded
                  </p>
                )}
                <Badge variant={referral.status === 'rewarded' ? 'default' : 'secondary'}>
                  {referral.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}