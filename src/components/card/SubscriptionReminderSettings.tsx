import { useState } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCardSubscriptions } from '@/hooks/useCardSubscriptions';

interface SubscriptionReminderSettingsProps {
  subscriptionId: string;
  enabled: boolean;
  daysBefore: number;
}

export function SubscriptionReminderSettings({
  subscriptionId,
  enabled: initialEnabled,
  daysBefore: initialDaysBefore,
}: SubscriptionReminderSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [daysBefore, setDaysBefore] = useState(initialDaysBefore);
  const { toggleReminder } = useCardSubscriptions();

  const handleToggle = (newEnabled: boolean) => {
    setEnabled(newEnabled);
    toggleReminder({
      subscriptionId,
      enabled: newEnabled,
      daysBefore,
    });
  };

  const handleDaysChange = (newDays: string) => {
    const days = parseInt(newDays);
    setDaysBefore(days);
    toggleReminder({
      subscriptionId,
      enabled,
      daysBefore: days,
    });
  };

  return (
    <Card className="p-4 bg-muted/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor={`reminder-${subscriptionId}`} className="font-medium">
              Cancel Reminder
            </Label>
          </div>
          <Switch
            id={`reminder-${subscriptionId}`}
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {enabled && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">Remind me</Label>
            <Select value={daysBefore.toString()} onValueChange={handleDaysChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before</SelectItem>
                <SelectItem value="3">3 days before</SelectItem>
                <SelectItem value="7">7 days before</SelectItem>
                <SelectItem value="14">14 days before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Get notified before your subscription renews so you can cancel if needed
        </p>
      </div>
    </Card>
  );
}