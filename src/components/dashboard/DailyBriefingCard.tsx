import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { TypewriterText } from '@/components/ui/typewriter-text';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { BriefingSkeleton } from './skeletons/BriefingSkeleton';

export function DailyBriefingCard() {
  const todayDateString = new Date().toISOString().split('T')[0];

  const { data: briefing, isLoading } = useQuery({
    queryKey: ['daily-briefing', todayDateString],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-daily-briefing');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 1
  });

  if (isLoading) {
    return <BriefingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 backdrop-blur-xl bg-card/80 border-border/40 hover:border-primary/20 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          <h3 className="font-semibold text-foreground">Daily Briefing</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
        
        {briefing?.message ? (
          <TypewriterText 
            text={briefing.message} 
            speed={20}
            className="text-sm text-foreground/90 leading-relaxed"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Welcome back! Your financial briefing will appear here.
          </p>
        )}
      </Card>
    </motion.div>
  );
}
