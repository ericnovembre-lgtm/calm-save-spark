import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScanningLoader } from "./ScanningLoader";
import confetti from "canvas-confetti";
import { RadarScanIcon, SuccessCheckIcon, TargetLockIcon } from "@/components/ui/animated-icons";
import { coachSounds } from "@/lib/coach-sounds";

interface OpportunityRadarProps {
  userId: string;
}

interface Opportunity {
  id: string;
  type: "arbitrage" | "waste" | "optimization";
  title: string;
  description: string;
  roi: number;
  action: string;
}

export function OpportunityRadar({ userId }: OpportunityRadarProps) {
  const queryClient = useQueryClient();

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["opportunity-radar", userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "generate-ai-opportunity-scanner",
        { body: { userId } }
      );

      if (error) throw error;

      // Transform to opportunity format and sort by ROI
      const transformed: Opportunity[] = (data.opportunities || [])
        .map((opp: any) => ({
          id: opp.id || Math.random().toString(),
          type: opp.category === "yield_optimization" ? "arbitrage" : 
                opp.category === "subscription_waste" ? "waste" : "optimization",
          title: opp.title,
          description: opp.description,
          roi: opp.annual_impact || 0,
          action: opp.action || "Review",
        }))
        .sort((a: Opportunity, b: Opportunity) => Math.abs(b.roi) - Math.abs(a.roi));

      return transformed;
    },
    staleTime: 5 * 60 * 1000,
  });

  const executeMutation = useMutation({
    mutationFn: async (opportunity: Opportunity) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('agent_actions').insert([{
        user_id: user.id,
        action_type: 'opportunity_executed',
        parameters: JSON.parse(JSON.stringify({ opportunity })),
        success: true,
        executed_at: new Date().toISOString(),
      }]);

      if (error) throw error;
      return opportunity;
    },
    onSuccess: (opportunity) => {
      // Remove from local cache - liquid layout animates the removal
      queryClient.setQueryData(['opportunity-radar', userId], (old: Opportunity[] | undefined) =>
        old?.filter((o) => o.id !== opportunity.id) || []
      );

      // Trigger confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#8b5cf6', '#10b981'],
      });

      // Play success sound
      coachSounds.playOpportunityExecuted();

      // Show success toast with animated icon
      toast.success(`Executed: ${opportunity.title}`, {
        icon: <SuccessCheckIcon size={16} />,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to execute: ${error.message}`);
    },
  });

  const handleExecute = async (opportunity: Opportunity) => {
    executeMutation.mutate(opportunity);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "arbitrage":
        return <TrendingUp className="w-4 h-4" />;
      case "waste":
        return <X className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "arbitrage":
        return "bg-command-cyan/10 border-command-cyan/30 text-command-cyan";
      case "waste":
        return "bg-command-rose/10 border-command-rose/30 text-command-rose";
      default:
        return "bg-command-violet/10 border-command-violet/30 text-command-violet";
    }
  };

  if (isLoading) {
    return <ScanningLoader text="Scanning for opportunities..." />;
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="bg-command-surface border border-white/10 rounded-2xl p-8 text-center">
        <TrendingUp className="w-12 h-12 text-white/30 mx-auto mb-3" />
        <p className="text-white/60 font-mono text-sm">
          No opportunities detected at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <RadarScanIcon size={20} className="text-command-cyan" />
        <h3 className="text-lg font-semibold text-white font-mono">
          Opportunity Radar
        </h3>
        <span className="text-xs text-white/40 font-mono">
          Sorted by ROI
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {opportunities.map((opp, idx) => (
            <motion.div
              key={opp.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                layout: { duration: 0.3 }
              }}
              className={`rounded-lg border p-4 ${getColors(opp.type)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getIcon(opp.type)}
                  <span className="text-xs font-mono uppercase opacity-70">
                    {opp.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-lg font-bold font-mono">
                    {opp.roi > 0 ? "+" : ""}
                    {Math.abs(opp.roi).toLocaleString()}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-sm mb-2 font-mono">
                {opp.title}
              </h4>

              <p className="text-xs opacity-80 mb-4 line-clamp-2">
                {opp.description}
              </p>

              <Button
                size="sm"
                onClick={() => handleExecute(opp)}
                disabled={executeMutation.isPending}
                className="w-full h-8 text-xs font-mono bg-white/10 hover:bg-white/20 group relative"
              >
                <span className="flex items-center gap-2 justify-center">
                  <TargetLockIcon 
                    size={14} 
                    autoplay={false}
                    className="opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                  {executeMutation.isPending ? "Executing..." : `${opp.action} →`}
                </span>
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
