import { motion } from "framer-motion";
import { Zap, TrendingDown, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CompetitorAlertsProps {
  alerts: any[];
}

export function CompetitorAlerts({ alerts }: CompetitorAlertsProps) {
  const queryClient = useQueryClient();

  const handleAcknowledge = async (alertId: string) => {
    const { error } = await supabase
      .from('competitor_alerts')
      .update({ acknowledged: true })
      .eq('id', alertId);

    if (error) {
      toast.error("Failed to acknowledge alert");
      return;
    }

    toast.success("Alert acknowledged");
    queryClient.invalidateQueries({ queryKey: ['competitor-alerts'] });
  };

  const unacknowledged = alerts.filter(a => !a.acknowledged);

  if (unacknowledged.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No new alerts. We're monitoring for better deals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unacknowledged.map((alert, index) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl border-2 border-warning/50 bg-warning/5 relative"
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => handleAcknowledge(alert.id)}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-start gap-3 pr-8">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-warning/20 border border-warning flex items-center justify-center flex-shrink-0">
              {alert.alert_type === 'price_drop' ? (
                <TrendingDown className="w-5 h-5 text-warning" />
              ) : (
                <Zap className="w-5 h-5 text-warning" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-warning border-warning">
                  {alert.alert_type.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                </span>
              </div>

              <h4 className="font-bold text-foreground mb-1">
                {alert.competitor_provider} now offers better pricing
              </h4>

              <p className="text-sm text-muted-foreground mb-2">
                New price: <span className="text-success font-bold">${alert.competitor_price.toFixed(2)}/mo</span>
                {" vs your current "}
                <span className="text-destructive font-bold">${alert.user_current_price.toFixed(2)}/mo</span>
              </p>

              <div className="flex items-center gap-2 text-sm">
                <div className="text-success font-bold">
                  Save ${alert.potential_savings.toFixed(0)}/mo
                </div>
                <div className="text-muted-foreground">
                  (${(alert.potential_savings * 12).toFixed(0)}/yr)
                </div>
              </div>
            </div>
          </div>

          {/* Pulse Animation */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-warning"
            animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      ))}
    </div>
  );
}