import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { useUserMilestones } from '@/hooks/useUserMilestones';

export function MilestoneTimelineHero() {
  const { milestones, totalCount } = useUserMilestones();

  const thisYearCount = milestones.filter(m => 
    new Date(m.achieved_at).getFullYear() === new Date().getFullYear()
  ).length;

  const recentMilestone = milestones[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20 p-6 border border-amber-500/20"
      data-copilot-id="milestones-timeline-hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Financial Journey</h1>
            <p className="text-muted-foreground">Celebrate every milestone along the way</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="w-4 h-4" />
              <span className="text-sm">Total Milestones</span>
            </div>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">This Year</span>
            </div>
            <p className="text-2xl font-bold">{thisYearCount}</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">Latest</span>
            </div>
            <p className="text-sm font-medium truncate">
              {recentMilestone?.milestone_name || 'Start your journey'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
