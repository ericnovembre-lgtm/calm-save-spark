import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PhoneMockup3D } from './PhoneMockup3D';
import { TypewriterInput } from './TypewriterInput';
import { AuroraBackground } from './AuroraBackground';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoalData {
  name: string;
  targetAmount: number;
  timeline: string;
  backgroundImage: string;
  progress: number;
}

export const GenerativeHero = () => {
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();
  const [goalData, setGoalData] = useState<GoalData>({
    name: 'Your Dream Goal',
    targetAmount: 5000,
    timeline: '12 months',
    backgroundImage: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)',
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateGoal = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 3) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-preview', {
        body: { goalInput: input },
      });

      if (error) throw error;

      if (data) {
        setGoalData({
          name: data.name || input,
          targetAmount: data.targetAmount || 5000,
          timeline: data.timeline || '12 months',
          backgroundImage: data.backgroundImage || 'linear-gradient(135deg, hsl(280 100% 70%) 0%, hsl(200 100% 70%) 100%)',
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Error generating goal:', error);
      toast({
        title: "Generation Error",
        description: "Using preset goal data instead",
        variant: "default",
      });
      
      // Fallback to simple parsing
      setGoalData({
        name: input,
        targetAmount: 5000,
        timeline: '12 months',
        backgroundImage: 'linear-gradient(135deg, hsl(280 100% 70%) 0%, hsl(200 100% 70%) 100%)',
        progress: 0,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return (
    <section className="relative min-h-[90vh] flex items-center px-4 md:px-20 py-20 overflow-hidden">
      <AuroraBackground />
      
      <div className="container mx-auto relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Input */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div>
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-semibold text-accent uppercase tracking-wider mb-4"
              >
                Experience $ave+ Live
              </motion.div>
              
              <h1 className="font-display font-black text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.9] tracking-tighter mb-6">
                See Your{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                    Future
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] blur-2xl opacity-20 animate-gradient-shift" />
                </span>
                <br />
                Instantly
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 font-light">
                Type what you want to save for and watch $ave+ create a personalized savings plan in real-time.
              </p>
            </div>
            
            <TypewriterInput onSubmit={generateGoal} isLoading={isGenerating} />
            
            {/* Trust Indicators */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 pt-6 border-t border-border/50"
            >
              {[
                { value: '50K+', label: 'Active Savers' },
                { value: '$2.1M+', label: 'Total Saved' },
                { value: '4.9★', label: 'User Rating' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <div className="text-2xl md:text-3xl font-display font-black text-accent">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right: 3D Phone Mockup */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="hidden lg:flex justify-center items-center"
          >
            <PhoneMockup3D goalData={goalData} isLoading={isGenerating} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
