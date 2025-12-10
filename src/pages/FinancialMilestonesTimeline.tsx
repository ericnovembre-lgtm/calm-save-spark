import { useState } from 'react';
import { motion } from 'framer-motion';
import { MilestoneTimelineHero } from '@/components/milestones/MilestoneTimelineHero';
import { TimelineTrack } from '@/components/milestones/TimelineTrack';
import { MilestoneFilters } from '@/components/milestones/MilestoneFilters';
import { UpcomingMilestones } from '@/components/milestones/UpcomingMilestones';
import { useUserMilestones } from '@/hooks/useUserMilestones';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FinancialMilestonesTimeline() {
  const { milestonesByYear } = useUserMilestones();
  const [filter, setFilter] = useState('all');
  const [year, setYear] = useState('all');

  const availableYears = Object.keys(milestonesByYear).sort().reverse();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6" data-copilot-id="milestones-timeline-page">
      <MilestoneTimelineHero />

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="by-year">By Year</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <MilestoneFilters
            onFilterChange={setFilter}
            onYearChange={setYear}
            availableYears={availableYears}
          />
          <TimelineTrack filter={filter} year={year === 'all' ? undefined : year} />
        </TabsContent>

        <TabsContent value="upcoming">
          <div className="grid md:grid-cols-2 gap-6">
            <UpcomingMilestones />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <h3 className="font-semibold mb-4">Tips to Unlock More</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Save consistently to build streaks
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Set and reach small goals first
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Connect more accounts for deeper insights
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Track your net worth monthly
                </li>
              </ul>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="by-year">
          <div className="space-y-8">
            {availableYears.map(y => (
              <div key={y}>
                <h3 className="text-xl font-bold mb-4">{y}</h3>
                <TimelineTrack year={y} />
              </div>
            ))}
            {availableYears.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No milestones yet. Start your journey today!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
