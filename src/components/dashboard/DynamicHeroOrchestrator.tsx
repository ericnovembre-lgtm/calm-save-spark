import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { BillsDueHero } from "./hero/BillsDueHero";
import { SavingsHighHero } from "./hero/SavingsHighHero";
import { OverspendingHero } from "./hero/OverspendingHero";
import { GoalNearHero } from "./hero/GoalNearHero";
import { DefaultHero } from "./hero/DefaultHero";
import { Skeleton } from "@/components/ui/skeleton";

export interface HeroContext {
  type: 'bills_due' | 'savings_high' | 'overspending' | 'goal_near' | 'default';
  urgency: 'critical' | 'warning' | 'info';
  data: any;
}

export function DynamicHeroOrchestrator() {
  const { data: heroContext, isLoading } = useQuery<HeroContext>({
    queryKey: ['hero-context'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-hero-context');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Cache for 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 bg-card/70 backdrop-blur-xl border border-border/40 rounded-2xl">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  const renderHero = () => {
    if (!heroContext) return <DefaultHero />;

    switch (heroContext.type) {
      case 'bills_due':
        return <BillsDueHero data={heroContext.data} urgency={heroContext.urgency} />;
      case 'savings_high':
        return <SavingsHighHero data={heroContext.data} />;
      case 'overspending':
        return <OverspendingHero data={heroContext.data} urgency={heroContext.urgency} />;
      case 'goal_near':
        return <GoalNearHero data={heroContext.data} />;
      default:
        return <DefaultHero />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={heroContext?.type || 'default'}
        layoutId="hero-section"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderHero()}
      </motion.div>
    </AnimatePresence>
  );
}
