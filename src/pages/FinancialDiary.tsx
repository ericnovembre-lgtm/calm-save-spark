import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiaryEntryCard } from '@/components/financial-diary/DiaryEntryCard';
import { CreateDiaryEntryModal } from '@/components/financial-diary/CreateDiaryEntryModal';
import { DiaryCalendarView } from '@/components/financial-diary/DiaryCalendarView';
import { MoodTrendsChart } from '@/components/financial-diary/MoodTrendsChart';
import { useDiaryEntries, useMoodAnalytics } from '@/hooks/useDiaryEntries';
import { Book, Plus, Calendar, TrendingUp, List } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { AnimatePresence } from 'framer-motion';

export default function FinancialDiary() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { entries, isLoading, createEntry, deleteEntry } = useDiaryEntries();
  const { data: moodAnalytics } = useMoodAnalytics();

  const entriesForSelectedDate = entries.filter(e => 
    isSameDay(new Date(e.entry_date), selectedDate)
  );

  return (
    <AppLayout>
      <div 
        className="container max-w-6xl mx-auto px-4 py-8 space-y-6"
        data-copilot-id="financial-diary-page"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Book className="w-6 h-6" />
              Financial Diary
            </h1>
            <p className="text-muted-foreground">
              Track your financial thoughts and emotional journey
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Mood Analytics Summary */}
        {moodAnalytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold">{moodAnalytics.totalEntries}</div>
              <div className="text-sm text-muted-foreground">Entries (30d)</div>
            </div>
            {moodAnalytics.averageMoodScore && (
              <div className="p-4 bg-card rounded-lg border">
                <div className="text-2xl font-bold">
                  {moodAnalytics.averageMoodScore.toFixed(1)}/5
                </div>
                <div className="text-sm text-muted-foreground">Avg Mood</div>
              </div>
            )}
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold">
                ${moodAnalytics.stressSpending.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Stress Spending</div>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <div className="text-2xl font-bold">
                {Object.keys(moodAnalytics.moodDistribution).length}
              </div>
              <div className="text-sm text-muted-foreground">Mood Types</div>
            </div>
          </div>
        )}

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Entries
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Book className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No diary entries yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start journaling your financial thoughts and feelings
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Entry
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {entries.map(entry => (
                  <DiaryEntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={id => deleteEntry.mutate(id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <DiaryCalendarView
                entries={entries}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              
              <div className="space-y-4">
                <h3 className="font-medium">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                {entriesForSelectedDate.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No entries for this date
                  </p>
                ) : (
                  entriesForSelectedDate.map(entry => (
                    <DiaryEntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={id => deleteEntry.mutate(id)}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <MoodTrendsChart entries={entries} />
          </TabsContent>
        </Tabs>

        <CreateDiaryEntryModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={entry => createEntry.mutate(entry)}
        />
      </div>
    </AppLayout>
  );
}