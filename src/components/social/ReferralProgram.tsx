import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: referrals } = useQuery({
    queryKey: ['user-referrals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  useEffect(() => {
    const generateReferralCode = async () => {
      if (!user) return;
      
      const { data: existing } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_user_id', user.id)
        .single();

      if (existing) {
        setReferralCode(existing.referral_code);
      } else {
        const code = `SAVE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setReferralCode(code);
        
        await supabase.from('referrals').insert({
          referrer_user_id: user.id,
          referral_code: code
        } as any);
      }
    };

    generateReferralCode();
  }, [user]);

  const copyReferralLink = () => {
    const link = `https://saveplus.app/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const totalRewards = referrals?.reduce((sum, r) => sum + parseFloat(r.reward_amount.toString()), 0) || 0;

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Refer Friends, Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get $10 for each friend who signs up and starts saving
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{referrals?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Referrals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{referrals?.filter(r => r.status === 'completed').length || 0}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">${totalRewards.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Earned</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Code</label>
            <div className="flex gap-2">
              <Input value={referralCode} readOnly className="font-mono" />
              <Button onClick={copyReferralLink} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold mb-4">Your Referrals</h4>
        <div className="space-y-2">
          {referrals && referrals.length > 0 ? (
            referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {referral.referred_email || 'Pending signup'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={referral.status === 'rewarded' ? 'default' : 'secondary'}>
                  {referral.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No referrals yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}