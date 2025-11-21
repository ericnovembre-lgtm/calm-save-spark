import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, TrendingUp } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Card } from '@/components/ui/card';

const milestones = [
  {
    id: 1,
    year: '2021',
    title: 'Founded',
    description: 'Started with a vision to democratize wealth management',
    completed: true
  },
  {
    id: 2,
    year: '2022',
    title: '10K Users',
    description: 'Reached our first major milestone with amazing community support',
    completed: true
  },
  {
    id: 3,
    year: '2023',
    title: 'AI Integration',
    description: 'Launched advanced AI-powered financial coaching',
    completed: true
  },
  {
    id: 4,
    year: '2024',
    title: '250K Users',
    description: 'Growing community saving smarter together',
    completed: true
  },
  {
    id: 5,
    year: '2025',
    title: 'Global Expansion',
    description: 'Bringing $ave+ to users worldwide',
    completed: false
  }
];

export function InteractiveTimeline() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From humble beginnings to empowering hundreds of thousands
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary via-accent to-primary/20" />

          <div className="space-y-16">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={prefersReducedMotion ? {} : { 
                  opacity: 0, 
                  x: index % 2 === 0 ? -50 : 50 
                }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Content card */}
                <div className="flex-1">
                  <Card
                    className="p-6 bg-background/80 backdrop-blur-sm border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => setSelectedMilestone(
                      selectedMilestone === milestone.id ? null : milestone.id
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {milestone.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-primary">
                            {milestone.year}
                          </span>
                          <h3 className="text-xl font-semibold text-foreground">
                            {milestone.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground">
                          {milestone.description}
                        </p>
                        
                        <AnimatePresence>
                          {selectedMilestone === milestone.id && (
                            <motion.div
                              initial={prefersReducedMotion ? {} : { 
                                opacity: 0, 
                                height: 0 
                              }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-border"
                            >
                              <p className="text-sm text-muted-foreground">
                                This milestone represents a significant achievement in our journey to revolutionize personal finance.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Timeline dot */}
                <div className="relative z-10">
                  <motion.div
                    className={`w-8 h-8 rounded-full border-4 ${
                      milestone.completed 
                        ? 'bg-primary border-primary' 
                        : 'bg-background border-muted-foreground'
                    }`}
                    animate={prefersReducedMotion ? {} : milestone.completed ? {
                      boxShadow: [
                        '0 0 0 0 hsl(var(--primary) / 0.7)',
                        '0 0 0 10px hsl(var(--primary) / 0)',
                      ]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>

          {/* Future indicator */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold text-foreground">
              The journey continues...
            </p>
            <p className="text-muted-foreground">
              Join us as we build the future of finance
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
