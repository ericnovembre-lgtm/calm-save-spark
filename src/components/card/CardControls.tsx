import { useState } from 'react';
import { Shield, Globe, Smartphone, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type CardControl = Database['public']['Tables']['card_controls']['Row'];

interface CardControlsProps {
  controls: CardControl;
  onUpdate?: (updates: Partial<CardControl>) => void;
}

export function CardControls({ controls, onUpdate }: CardControlsProps) {
  const [dailyLimit, setDailyLimit] = useState(
    controls.daily_spend_limit_cents ? controls.daily_spend_limit_cents / 100 : 1000
  );
  const [singleLimit, setSingleLimit] = useState(
    controls.single_transaction_limit_cents ? controls.single_transaction_limit_cents / 100 : 500
  );

  const handleToggle = (key: keyof CardControl, value: boolean) => {
    onUpdate?.({ [key]: value });
  };

  const handleLimitUpdate = () => {
    onUpdate?.({
      daily_spend_limit_cents: Math.round(dailyLimit * 100),
      single_transaction_limit_cents: Math.round(singleLimit * 100),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Label htmlFor="international" className="cursor-pointer">
                International Transactions
              </Label>
            </div>
            <Switch
              id="international"
              checked={controls.international_enabled}
              onCheckedChange={(checked) => handleToggle('international_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <Label htmlFor="contactless" className="cursor-pointer">
                Contactless Payments
              </Label>
            </div>
            <Switch
              id="contactless"
              checked={controls.contactless_enabled}
              onCheckedChange={(checked) => handleToggle('contactless_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <Label htmlFor="online" className="cursor-pointer">
                Online Purchases
              </Label>
            </div>
            <Switch
              id="online"
              checked={controls.online_enabled}
              onCheckedChange={(checked) => handleToggle('online_enabled', checked)}
            />
          </div>
        </div>

        {/* Spending Limits */}
        <div className="pt-4 border-t space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Spending Limits</h4>
          
          <div className="space-y-2">
            <Label htmlFor="daily-limit">Daily Limit</Label>
            <div className="flex gap-2">
              <Input
                id="daily-limit"
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                min={0}
                step={10}
                className="flex-1"
              />
              <span className="flex items-center text-muted-foreground">USD</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="single-limit">Single Transaction Limit</Label>
            <div className="flex gap-2">
              <Input
                id="single-limit"
                type="number"
                value={singleLimit}
                onChange={(e) => setSingleLimit(Number(e.target.value))}
                min={0}
                step={10}
                className="flex-1"
              />
              <span className="flex items-center text-muted-foreground">USD</span>
            </div>
          </div>

          <Button onClick={handleLimitUpdate} className="w-full">
            Update Limits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
