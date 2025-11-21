import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const timelineData = [
  { date: '2024-01', label: 'Jan 2024', event: 'Started budgeting', score: 65 },
  { date: '2024-02', label: 'Feb 2024', event: 'First automation setup', score: 72 },
  { date: '2024-03', label: 'Mar 2024', event: 'Paid off credit card', score: 85 },
  { date: '2024-04', label: 'Apr 2024', event: 'Emergency fund goal reached', score: 92 }
];

export function HubTimeMachine() {
  const [currentIndex, setCurrentIndex] = useState(timelineData.length - 1);
  const [isOpen, setIsOpen] = useState(false);

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goForward = () => {
    if (currentIndex < timelineData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentData = timelineData[currentIndex];

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="fixed top-32 right-6 z-40"
      >
        <Clock className="w-4 h-4 mr-2" />
        Time Machine
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-44 right-6 z-40 w-80"
          >
            <Card className="p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-1">{currentData.label}</h3>
                <p className="text-sm text-muted-foreground">{currentData.event}</p>
              </div>

              <div className="mb-6">
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-primary">{currentData.score}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentData.score}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  onClick={goBack}
                  disabled={currentIndex === 0}
                  variant="outline"
                  size="icon"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-1">
                  {timelineData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentIndex ? 'bg-primary w-8' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={goForward}
                  disabled={currentIndex === timelineData.length - 1}
                  variant="outline"
                  size="icon"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
