import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, TrendingUp, Bell, Target, Calendar, X, ArrowRight } from "lucide-react";
import { useProactiveNudges } from "@/hooks/useProactiveNudges";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { VoiceBriefingPlayer } from "@/components/voice/VoiceBriefingPlayer";
import { useSpeakableText } from "@/hooks/useSpeakableText";
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
  1: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
  2: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600',
  3: 'bg-red-500/10 border-red-500/20 text-red-600',
};

export function ProactiveNudgesBanner() {
  const { nudges, dismissNudge, actOnNudge } = useProactiveNudges();
  const navigate = useNavigate();
  const { generateNudgeSummary } = useSpeakableText();

  if (nudges.length === 0) return null;

  const topNudge = nudges[0];
  const Icon = nudgeIcons[topNudge.nudge_type] || Bell;
  const colorClass = nudgeColors[topNudge.priority] || nudgeColors[1];

  const handleAction = () => {
    actOnNudge(topNudge.id);
    if (topNudge.action_url) {
      navigate(topNudge.action_url);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={topNudge.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative border rounded-lg p-4 mb-4',
          colorClass
        )}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">
              {topNudge.agent_type.split('_').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
              ).join(' ')}
            </p>
            <p className="text-sm opacity-90">
              {topNudge.message}
            </p>

            {topNudge.action_url && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 h-7 px-3"
                onClick={handleAction}
              >
                Take Action
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <VoiceBriefingPlayer
              text={generateNudgeSummary(topNudge.message, topNudge.nudge_type)}
              className="flex-shrink-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-70 hover:opacity-100"
              onClick={() => dismissNudge(topNudge.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {nudges.length > 1 && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <p className="text-xs opacity-70">
              +{nudges.length - 1} more notification{nudges.length > 2 ? 's' : ''}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
