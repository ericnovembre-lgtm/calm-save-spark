import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Zap, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetWorthMilestone, MilestoneType } from '@/hooks/useNetWorthMilestones';
import { format } from 'date-fns';

interface NetWorthMilestonesProps {
  milestones: NetWorthMilestone[];
  getMilestoneLabel: (type: MilestoneType) => string;
  getMilestoneIcon: (type: MilestoneType) => string;
}

const MILESTONE_ICONS: Record<MilestoneType, React.ReactNode> = {
  positive_net_worth: <Star className="w-4 h-4" />,
  round_number: <Trophy className="w-4 h-4" />,
  all_time_high: <TrendingUp className="w-4 h-4" />,
  debt_free: <Zap className="w-4 h-4" />,
  savings_goal: <Target className="w-4 h-4" />,
  custom: <Sparkles className="w-4 h-4" />,
};

const MILESTONE_COLORS: Record<MilestoneType, string> = {
  positive_net_worth: 'bg-green-500/10 text-green-500 border-green-500/20',
  round_number: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  all_time_high: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  debt_free: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  savings_goal: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  custom: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

export function NetWorthMilestones({ milestones, getMilestoneLabel, getMilestoneIcon }: NetWorthMilestonesProps) {
  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            Your achievements will appear here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Keep tracking to unlock milestones!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-copilot-id="net-worth-milestones">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Milestones
          <Badge variant="secondary" className="ml-auto">
            {milestones.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {milestones.slice(0, 5).map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${MILESTONE_COLORS[milestone.milestone_type]}`}
            >
              <div className="p-2 rounded-lg bg-background/50">
                {MILESTONE_ICONS[milestone.milestone_type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {getMilestoneLabel(milestone.milestone_type)}
                </p>
                <p className="text-xs opacity-80">
                  ${milestone.milestone_value.toLocaleString()}
                </p>
              </div>
              <p className="text-xs opacity-60">
                {format(new Date(milestone.achieved_at), 'MMM d, yyyy')}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {milestones.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{milestones.length - 5} more milestones
          </p>
        )}
      </CardContent>
    </Card>
  );
}
