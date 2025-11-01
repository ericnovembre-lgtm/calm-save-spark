import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Settings, 
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

interface SubscriptionData {
  subscription_amount: number;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { features, loading: featuresLoading, subscriptionAmount } = useFeatureAccess();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAmount, setNewAmount] = useState(5);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('subscription_amount, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSubscription(data);
      setNewAmount(data.subscription_amount);
    }
    setLoading(false);
  };

  const handleUpdateSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_subscriptions')
      .update({ subscription_amount: newAmount })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Subscription updated to $${newAmount}/month. Changes take effect next billing cycle.`,
      });
      fetchSubscription();
    }
  };

  if (loading || featuresLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your plan, billing, and features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                ${subscriptionAmount}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
              <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                {subscription?.status || 'active'}
              </Badge>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {subscription?.current_period_end 
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Amount: ${subscriptionAmount}
              </p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Managed via Stripe
              </p>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                Update Card
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Change Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Change Your Plan
            </CardTitle>
            <CardDescription>
              Adjust your subscription amount. Changes take effect at the next billing cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">${newAmount}</div>
                <div className="text-muted-foreground">per month</div>
              </div>

              <Slider
                value={[newAmount]}
                onValueChange={(v) => setNewAmount(v[0])}
                min={0}
                max={15}
                step={1}
                className="mb-6"
              />

              <div className="flex gap-2 justify-center mb-6">
                {[0, 5, 10, 15].map((amount) => (
                  <Button
                    key={amount}
                    variant={newAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              {newAmount !== subscriptionAmount && (
                <div className="bg-accent/50 border border-border rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold mb-1">
                        {newAmount > subscriptionAmount ? 'Upgrading' : 'Downgrading'} to ${newAmount}/month
                      </div>
                      <div className="text-muted-foreground">
                        {newAmount > subscriptionAmount 
                          ? `You'll unlock additional features immediately and be charged the prorated difference.`
                          : `You'll keep current features until the end of your billing cycle.`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpdateSubscription}
                disabled={newAmount === subscriptionAmount}
                className="w-full"
                size="lg"
              >
                Update Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your Current Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>{features?.max_goals === 999 ? 'Unlimited' : features?.max_goals} savings goals</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>{features?.max_pots === 999 ? 'Unlimited' : features?.max_pots} smart pots</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>{features?.apy_rate}% APY</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>{features?.max_automation_rules || 'No'} automation rules</span>
              </div>
              {features?.has_ai_insights && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>AI-powered insights</span>
                </div>
              )}
              {features?.has_saveplus_card && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>$ave+ Card ({features.cashback_rate}% cashback)</span>
                </div>
              )}
              {features?.has_analytics && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Advanced analytics</span>
                </div>
              )}
              {features?.has_priority_support && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Priority support</span>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={() => navigate('/pricing')}
              className="w-full mt-6 gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              View All Features
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
