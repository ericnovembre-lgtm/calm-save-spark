import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Feature descriptions by price point
const FEATURE_DESCRIPTIONS: Record<number, string[]> = {
  0: ['Up to 3 savings goals', '5 smart pots', 'Basic round-up automation', '3.5% APY', 'Mobile & web app', 'Email support'],
  1: ['Up to 5 savings goals', '5 smart pots', '3.75% APY', 'All free features'],
  2: ['Up to 5 goals', '10 smart pots', 'Basic spending insights', 'All previous features'],
  3: ['Up to 7 goals', '2 custom automation rules', 'All previous features'],
  4: ['4.0% APY', 'Export transactions (CSV)', 'All previous features'],
  5: ['Up to 10 savings goals', 'AI-powered savings tips', 'All previous features'],
  6: ['15 smart pots', 'Advanced analytics dashboard', 'All previous features'],
  7: ['5 custom automation rules', 'Goal milestones & celebrations', 'All previous features'],
  8: ['Priority email support', 'Weekly financial reports', 'All previous features'],
  9: ['Unlimited savings goals', '4.15% APY', 'All previous features'],
  10: ['Unlimited smart pots', 'AI financial coach (10 chats/month)', 'All previous features'],
  11: ['$ave+ Virtual Card', '1% cashback on purchases', 'All previous features'],
  12: ['Advanced AI insights', 'Predictive analytics', 'All previous features'],
  13: ['Physical $ave+ Card', '1.5% cashback', 'All previous features'],
  14: ['Priority phone support', 'Early access to features', 'All previous features'],
  15: ['4.25% APY', 'Unlimited AI coach', '2% cashback', 'Dedicated account manager', 'API access', 'Everything!'],
};

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const amount = location.state?.amount || 5;
  const features = FEATURE_DESCRIPTIONS[amount] || FEATURE_DESCRIPTIONS[5];

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // TODO: Integrate with Stripe when enabled
      toast({
        title: 'Coming Soon',
        description: 'Stripe integration will be enabled in the next step. For now, this is a preview.',
      });
      
      // Simulate checkout
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process checkout. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/pricing')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-5xl font-bold mb-2">
                  ${amount}
                  <span className="text-xl text-muted-foreground font-normal">/month</span>
                </div>
                <Badge className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  14-day free trial
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  What's included
                </h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Today's charge</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After trial (monthly)</span>
                  <span className="font-semibold">${amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure payment powered by Stripe
                </p>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Secure & Encrypted</div>
                  <div className="text-muted-foreground">Your payment information is protected with bank-level security</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Cancel Anytime</div>
                  <div className="text-muted-foreground">No commitments. Change or cancel your subscription anytime</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">14-Day Free Trial</div>
                  <div className="text-muted-foreground">Try all features risk-free. No charge until trial ends</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy. 
              You'll be charged ${amount}/month after your 14-day trial ends. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
