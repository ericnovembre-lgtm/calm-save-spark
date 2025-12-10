import { motion } from 'framer-motion';
import { useUserMilestones, UserMilestone } from '@/hooks/useUserMilestones';
import { MilestoneCard } from './MilestoneCard';
import { Skeleton } from '@/components/ui/skeleton';

interface TimelineTrackProps {
  filter?: string;
  year?: string;
}

export function TimelineTrack({ filter, year }: TimelineTrackProps) {
  const { milestones, milestonesByYear, isLoading } = useUserMilestones();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  let filteredMilestones = milestones;
  
  if (year && milestonesByYear[year]) {
    filteredMilestones = milestonesByYear[year];
  }
  
  if (filter && filter !== 'all') {
    filteredMilestones = filteredMilestones.filter(m => m.milestone_type === filter);
  }

  if (filteredMilestones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No milestones yet. Keep going!</p>
      </div>
    );
  }

  // Group by month
  const groupedByMonth: Record<string, UserMilestone[]> = {};
  filteredMilestones.forEach(milestone => {
    const date = new Date(milestone.completed_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groupedByMonth[key]) groupedByMonth[key] = [];
    groupedByMonth[key].push(milestone);
  });

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-orange-500 to-yellow-500 opacity-30" />

      <div className="space-y-8">
        {Object.entries(groupedByMonth).map(([monthKey, monthMilestones], groupIndex) => {
          const [y, m] = monthKey.split('-');
          const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
          });

          const dateToUse = monthMilestones[0]?.completed_at || new Date().toISOString();
          const [y, m] = monthKey.split('-');
          const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
          });

          return (
            <motion.div
              key={monthKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {m}
                </div>
                <h3 className="text-lg font-semibold">{monthName}</h3>
              </div>

              <div className="ml-16 space-y-3">
                {monthMilestones.map((milestone, index) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
