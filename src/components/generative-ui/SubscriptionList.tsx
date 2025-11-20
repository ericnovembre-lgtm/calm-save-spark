import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Calendar, DollarSign, X } from "lucide-react";
import { Subscription } from "./types";
import { useState } from "react";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onCancel?: (id: string) => void;
  onViewAll?: () => void;
}

export function SubscriptionList({ subscriptions, onCancel, onViewAll }: SubscriptionListProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const totalMonthly = subscriptions.reduce((sum, sub) => {
    return sum + (sub.frequency === 'monthly' ? sub.amount : sub.amount / 12);
  }, 0);

  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedSubscription && onCancel) {
      onCancel(selectedSubscription.id);
    }
    setCancelDialogOpen(false);
    setSelectedSubscription(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 backdrop-blur-sm bg-card/80 border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Active Subscriptions</h3>
          {onViewAll && (
            <Button size="sm" variant="ghost" onClick={onViewAll} className="text-xs">
              View All
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            {subscriptions.map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{sub.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span>${sub.amount.toFixed(2)}/{sub.frequency === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(sub.nextBilling).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {onCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelClick(sub)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Monthly</span>
          <span className="font-semibold text-sm text-foreground">${totalMonthly.toFixed(2)}/mo</span>
        </div>
      </Card>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {selectedSubscription?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your subscription to {selectedSubscription?.name}. 
              Your access will continue until {selectedSubscription?.nextBilling ? new Date(selectedSubscription.nextBilling).toLocaleDateString() : 'the end of the billing period'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
