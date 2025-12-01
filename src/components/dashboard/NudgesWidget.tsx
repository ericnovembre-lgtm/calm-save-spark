import { motion } from "framer-motion";
import { Bell, TrendingUp, AlertCircle, Target, Calendar, ArrowRight } from "lucide-react";
import { useProactiveNudges } from "@/hooks/useProactiveNudges";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nudgeIcons: Record<string, any> = {
  budget_warning: AlertCircle,
  savings_opportunity: TrendingUp,
  bill_reminder: Bell,
  goal_encouragement: Target,
  tax_deadline: Calendar,
};

const nudgeColors: Record<string, string> = {
  1: 'text-blue-600 bg-blue-500/10',
  2: 'text-yellow-600 bg-yellow-500/10',
  3: 'text-red-600 bg-red-500/10',
};

export function NudgesWidget() {
  const { nudges, actOnNudge } = useProactiveNudges();
  const navigate = useNavigate();

  const handleAction = (nudgeId: string, actionUrl: string | null) => {
    actOnNudge(nudgeId);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  if (nudges.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">AI Nudges</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          You're all caught up! Check back later for personalized recommendations.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">AI Nudges</h3>
          <p className="text-xs text-muted-foreground">{nudges.length} active recommendation{nudges.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-3">
        {nudges.slice(0, 3).map((nudge) => {
          const Icon = nudgeIcons[nudge.nudge_type] || Bell;
          const colorClass = nudgeColors[nudge.priority] || nudgeColors[1];

          return (
            <motion.div
              key={nudge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-muted/50 rounded-xl border border-border hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {nudge.agent_type.split('_').map(w => 
                      w.charAt(0).toUpperCase() + w.slice(1)
                    ).join(' ')}
                  </p>
                  <p className="text-sm mb-2 leading-snug">{nudge.message}</p>
                  {nudge.action_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-3 gap-1 text-xs"
                      onClick={() => handleAction(nudge.id, nudge.action_url)}
                    >
                      Take Action
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
