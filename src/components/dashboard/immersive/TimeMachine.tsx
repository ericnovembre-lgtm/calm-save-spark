import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TimelineEvent {
  date: string;
  type: 'milestone' | 'transaction' | 'goal';
  title: string;
  amount?: number;
}

export function TimeMachine() {
  const [currentYear, setCurrentYear] = useState(2025);
  const [events] = useState<TimelineEvent[]>([
    { date: 'Jan 2025', type: 'goal', title: 'Vacation Goal Created', amount: 5000 },
    { date: 'Feb 2025', type: 'milestone', title: '25% Savings Milestone', amount: 1250 },
    { date: 'Mar 2025', type: 'transaction', title: 'Large Deposit', amount: 2000 }
  ]);

  const travelToYear = (direction: 'past' | 'future') => {
    setCurrentYear(prev => direction === 'past' ? prev - 1 : prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg"
    >
      <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Financial Time Machine</h3>
              <p className="text-sm text-muted-foreground">Travel through your financial history</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-4xl"
          >
            ⏰
          </motion.div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => travelToYear('past')}
            disabled={currentYear <= 2020}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <motion.div
            key={currentYear}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <p className="text-5xl font-bold text-foreground">{currentYear}</p>
            <p className="text-sm text-muted-foreground">Year</p>
          </motion.div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => travelToYear('future')}
            disabled={currentYear >= 2030}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 mb-6">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-2xl border ${
                event.type === 'milestone'
                  ? 'bg-green-500/10 border-green-500/20'
                  : event.type === 'goal'
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-accent/50 border-border'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{event.date}</p>
                  <p className="font-medium text-foreground">{event.title}</p>
                </div>
                {event.amount && (
                  <p className="text-lg font-bold text-primary">${event.amount.toLocaleString()}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <Button className="w-full">
          <Play className="w-4 h-4 mr-2" />
          Play Financial Journey
        </Button>
      </div>
    </motion.div>
  );
}
