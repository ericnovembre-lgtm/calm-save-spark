import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, TrendingDown, Target, RefreshCw } from 'lucide-react';
import { WidgetPriority } from '@/hooks/useGenerativeLayoutEngine';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyBriefingAgentProps {
  totalBalance: number;
  monthlyChange: number;
  topPriorities: WidgetPriority[];
}

/**
 * Daily Briefing Agent
 * AI-powered natural language summary using Gemini
 */
export function DailyBriefingAgent({ totalBalance, monthlyChange, topPriorities }: DailyBriefingAgentProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Fetch AI-generated briefing
  const { data: briefingData, isLoading, refetch } = useQuery({
    queryKey: ['ai-daily-briefing'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-daily-briefing', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: 1
  });

  const briefingMessage = briefingData?.message || '';

  // Typewriter effect for AI-generated text
  useEffect(() => {
    if (!briefingMessage || isLoading) return;
    
    setIsTyping(true);
    setDisplayedText('');
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= briefingMessage.length) {
        setDisplayedText(briefingMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, 20); // 20ms per character

    return () => clearInterval(intervalId);
  }, [briefingMessage, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6 border-glass-border bg-glass backdrop-blur-glass shadow-glass">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-accent/10">
            <Sparkles className="w-6 h-6 text-accent drop-shadow-[0_0_8px_rgba(214,200,162,0.4)]" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {getGreeting()} 👋
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading || isTyping}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${(isLoading || isTyping) ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
              <p className="text-base leading-relaxed text-foreground min-h-[3rem]">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            )}
            
            {/* Financial indicators */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                {monthlyChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  ${Math.abs(monthlyChange).toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {topPriorities.length} priorities
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
