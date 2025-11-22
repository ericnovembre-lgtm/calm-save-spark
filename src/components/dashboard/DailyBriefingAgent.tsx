import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DailyBriefingAgentProps {
  totalBalance: number;
  monthlyChange: number;
  topPriorities: Array<{ id: string; urgencyReason: string; score: number }>;
}

/**
 * Daily Briefing Agent
 * Generates natural language summaries of financial health
 */
export function DailyBriefingAgent({ 
  totalBalance, 
  monthlyChange, 
  topPriorities 
}: DailyBriefingAgentProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const generateBriefing = (): string => {
    const isPositive = monthlyChange >= 0;
    const changeAmount = Math.abs(monthlyChange).toFixed(0);
    
    // Primary sentence: financial movement
    const primarySentence = isPositive
      ? `You're up $${changeAmount} this month`
      : `You're down $${changeAmount} this month`;
    
    // Secondary sentence: top priority insight
    const topPriority = topPriorities[0];
    let secondarySentence = '';
    
    if (topPriority?.id === 'balance' && topPriority.score > 90) {
      secondarySentence = 'Consider setting up automatic savings to build your cushion.';
    } else if (topPriority?.id === 'goals' && topPriority.score > 85) {
      secondarySentence = "You're close to completing a savings goal—keep it up!";
    } else if (topPriority?.id === 'portfolio' && topPriority.score > 85) {
      secondarySentence = 'Your portfolio is moving significantly—review your positions.';
    } else if (topPriority?.id === 'budgets' && topPriority.score > 80) {
      secondarySentence = 'Some budgets need attention—check your spending categories.';
    } else if (isPositive) {
      secondarySentence = 'Great progress! Keep tracking your goals.';
    } else {
      secondarySentence = 'Review your recent transactions for optimization opportunities.';
    }
    
    return `${primarySentence}. ${secondarySentence}`;
  };

  const briefing = generateBriefing();
  const isPositive = monthlyChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass backdrop-blur-glass p-6 shadow-glass"
    >
      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 opacity-5 ${
          isPositive 
            ? 'bg-gradient-to-br from-green-500 to-blue-500' 
            : 'bg-gradient-to-br from-orange-500 to-red-500'
        }`}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={!prefersReducedMotion ? {
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-5 h-5 text-accent" />
              </motion.div>
              <h2 className="text-lg font-semibold text-foreground">
                {getGreeting()}
              </h2>
            </div>
            
            <p className="text-2xl font-light text-foreground leading-relaxed">
              {briefing}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {isPositive ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Trending Up</span>
              </div>
            ) : monthlyChange < -100 ? (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Needs Review</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <TrendingDown className="w-5 h-5" />
                <span className="text-sm font-medium">Declining</span>
              </div>
            )}
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Balance</div>
              <div className="text-xl font-semibold text-foreground">
                ${totalBalance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
