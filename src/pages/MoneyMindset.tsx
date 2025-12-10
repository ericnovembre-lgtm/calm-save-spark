import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MindsetHero } from '@/components/mindset/MindsetHero';
import { ReflectionEditor } from '@/components/mindset/ReflectionEditor';
import { BeliefInventory } from '@/components/mindset/BeliefInventory';
import { AffirmationCarousel } from '@/components/mindset/AffirmationCarousel';
import { MindsetProgress } from '@/components/mindset/MindsetProgress';
import { MindsetCalendar } from '@/components/mindset/MindsetCalendar';
import { MindsetEntryCard } from '@/components/mindset/MindsetEntryCard';
import { useMoneyMindset } from '@/hooks/useMoneyMindset';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function MoneyMindset() {
  const { entries, isLoading } = useMoneyMindset();
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6" data-copilot-id="money-mindset-page">
      <MindsetHero />

      <div className="flex justify-end">
        <Button onClick={() => setShowEditor(!showEditor)}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {showEditor && (
        <ReflectionEditor onClose={() => setShowEditor(false)} />
      )}

      <Tabs defaultValue="journal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="beliefs">Beliefs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </>
              ) : entries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <p className="text-lg mb-2">Your mindset journal is empty</p>
                  <p className="text-sm">Start documenting your financial thoughts and beliefs</p>
                </motion.div>
              ) : (
                entries.map((entry, index) => (
                  <MindsetEntryCard key={entry.id} entry={entry} index={index} />
                ))
              )}
            </div>

            <div className="space-y-6">
              <MindsetCalendar />
              <AffirmationCarousel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="beliefs" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <BeliefInventory onAddNew={() => setShowEditor(true)} />
            <div className="space-y-6">
              <AffirmationCarousel />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <h3 className="font-semibold mb-4">Reframe Limiting Beliefs</h3>
                <div className="space-y-4 text-sm">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-500 font-medium">Limiting:</p>
                    <p className="text-muted-foreground">"I'll never be good with money"</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-green-500 font-medium">Empowering:</p>
                    <p className="text-muted-foreground">"I'm learning to manage money better every day"</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <MindsetProgress />
            <MindsetCalendar />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
