import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";
import { addMonths } from "date-fns";

interface ContextualSuggestionsProps {
  userId: string;
  onSuggestionClick: (suggestion: string) => void;
  messageCount: number;
}

export function ContextualSuggestions({
  userId,
  onSuggestionClick,
  messageCount,
}: ContextualSuggestionsProps) {
  const { data: healthData } = useFinancialHealth();

  // Fetch goals
  const { data: goals } = useQuery({
    queryKey: ['goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch budget spending
  const { data: budgetSpending } = useQuery({
    queryKey: ['budget_spending', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_spending')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch recent transactions
  const { data: transactions } = useQuery({
    queryKey: ['recent_transactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const suggestions = useMemo(() => {
    const contextualSuggestions: string[] = [];

    // Goal-based suggestions
    if (goals && goals.length > 0) {
      const strugglingGoals = goals.filter(
        (g) => g.current_amount / g.target_amount < 0.3
      );
      if (strugglingGoals.length > 0) {
        contextualSuggestions.push("How can I accelerate my savings goals?");
      }

      const urgentGoals = goals.filter(
        (g) => g.deadline && new Date(g.deadline) < addMonths(new Date(), 3)
      );
      if (urgentGoals.length > 0) {
        contextualSuggestions.push("Will I hit my goal deadline?");
      }
    }

    // Budget-based suggestions
    if (budgetSpending && budgetSpending.length > 0) {
      const hasOverspending = budgetSpending.some((b) => {
        const spent = b.spent_amount || 0;
        return spent > 1000;
      });
      if (hasOverspending) {
        contextualSuggestions.push("Help me get back on budget");
      }
    }

    // Transaction-based suggestions
    if (transactions && transactions.length > 0) {
      const categorySpending = transactions.reduce((acc, t) => {
        const cat = t.category || 'Other';
        acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

      const highestCategory = Object.entries(categorySpending).sort(
        ([, a], [, b]) => b - a
      )[0];

      if (highestCategory && highestCategory[1] > 500) {
        contextualSuggestions.push(
          `Why is my ${highestCategory[0]} spending so high?`
        );
      }
    }

    // Health-based suggestions
    if (healthData && healthData.overallScore < 60) {
      contextualSuggestions.push("How can I improve my financial health?");
    }

    // General suggestions
    if (contextualSuggestions.length < 3) {
      contextualSuggestions.push("What's my financial health score?");
      contextualSuggestions.push("Show me savings opportunities");
      contextualSuggestions.push("Analyze my spending patterns");
    }

    return contextualSuggestions.slice(0, 4);
  }, [goals, budgetSpending, transactions, healthData]);

  // Only show suggestions when conversation is empty or after each assistant response
  if (messageCount > 1 && messageCount % 2 !== 0) {
    return null;
  }

  return (
    <ScrollArea className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 p-2 overflow-x-auto"
      >
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick(suggestion)}
              className="whitespace-nowrap text-xs font-mono border-white/10 hover:border-command-cyan/50 hover:bg-command-cyan/10 text-white/80 hover:text-white"
            >
              <Sparkles className="w-3 h-3 mr-1 text-command-cyan" />
              {suggestion}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </ScrollArea>
  );
}
