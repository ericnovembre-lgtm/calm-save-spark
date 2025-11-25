import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Calendar, DollarSign, Bell, Check, X, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useCardSubscriptions } from '@/hooks/useCardSubscriptions';
import { SubscriptionReminderSettings } from './SubscriptionReminderSettings';
import { UpcomingChargesCard } from './UpcomingChargesCard';

export function CardSubscriptionTracker() {
  const {
    subscriptions,
    isLoading,
    totalMonthly,
    detectSubscriptions,
    isDetecting,
    toggleReminder,
    updateStatus,
    confirmSubscription,
  } = useCardSubscriptions();

  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const unconfirmedSubscriptions = subscriptions.filter(sub => !sub.is_confirmed);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Total</p>
              <p className="text-2xl font-bold">${totalMonthly.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Review</p>
              <p className="text-2xl font-bold">{unconfirmedSubscriptions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Charges */}
      <UpcomingChargesCard subscriptions={subscriptions} />

      {/* Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Subscription Detection</h3>
            <p className="text-sm text-muted-foreground">
              Scan your transactions for recurring charges
            </p>
          </div>
          <Button
            onClick={() => detectSubscriptions()}
            disabled={isDetecting}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            {isDetecting ? 'Scanning...' : 'Scan Now'}
          </Button>
        </div>
      </Card>

      {/* Subscription List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>
            Manage your recurring card charges and set cancel reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {subscriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No subscriptions detected</p>
                  <p className="text-sm mt-1">Click "Scan Now" to detect recurring charges</p>
                </div>
              ) : (
                subscriptions.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-4 ${
                      sub.status === 'cancelled' ? 'opacity-60' : ''
                    } ${
                      !sub.is_confirmed ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20' : ''
                    }`}>
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">
                            {sub.category === 'Entertainment' ? '🎬' : 
                             sub.category === 'Shopping' ? '🛍️' :
                             sub.category === 'Bills' ? '📄' : '🔄'}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold truncate">
                                  {sub.ai_merchant_name || sub.merchant_name}
                                </h4>
                                {!sub.is_confirmed && (
                                  <Badge variant="outline" className="text-amber-600 border-amber-600/30">
                                    Unconfirmed
                                  </Badge>
                                )}
                                {sub.zombie_score > 0.7 && (
                                  <Badge variant="outline" className="text-red-600 border-red-600/30">
                                    Zombie 🧟
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="capitalize">{sub.frequency}</span>
                                <span>•</span>
                                <span>${(sub.amount_cents / 100).toFixed(2)}</span>
                                {sub.next_expected_date && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Next: {new Date(sub.next_expected_date).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                              {sub.confidence < 0.8 && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {(sub.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                              )}
                            </div>

                            {/* Status Badge */}
                            <Badge
                              variant={
                                sub.status === 'active' ? 'default' :
                                sub.status === 'paused' ? 'secondary' : 'outline'
                              }
                              className="capitalize"
                            >
                              {sub.status}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                            {/* Reminder Toggle */}
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={sub.cancel_reminder_enabled}
                                onCheckedChange={(enabled) =>
                                  toggleReminder({
                                    subscriptionId: sub.id,
                                    enabled,
                                    daysBefore: sub.cancel_reminder_days_before
                                  })
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                <Bell className="w-3 h-3 inline mr-1" />
                                Remind me {sub.cancel_reminder_days_before}d before
                              </span>
                            </div>

                            {/* Confirm */}
                            {!sub.is_confirmed && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => confirmSubscription(sub.id)}
                                className="gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Confirm
                              </Button>
                            )}

                            {/* Cancel */}
                            {sub.status === 'active' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStatus({ subscriptionId: sub.id, status: 'cancelled' })}
                                className="gap-1 text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}