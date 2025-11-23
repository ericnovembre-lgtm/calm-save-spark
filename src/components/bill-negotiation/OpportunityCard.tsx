import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, MessageSquare, Flame, Target, Zap, Trophy } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AutopilotToggle } from "./AutopilotToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OpportunityCardProps {
  id: string;
  merchant: string;
  category?: string;
  currentAmount: number;
  estimatedSavings: number;
  confidenceScore: number;
  metadata?: any;
  onRequestNegotiation: () => void;
  onGenerateScript: () => void;
}

export function OpportunityCard({
  id,
  merchant,
  category,
  currentAmount,
  estimatedSavings,
  confidenceScore,
  metadata = {},
  onRequestNegotiation,
  onGenerateScript,
}: OpportunityCardProps) {
  const [autopilotEnabled, setAutopilotEnabled] = useState(metadata?.autopilot_enabled || false);
  const savingsPercentage = ((estimatedSavings / currentAmount) * 100).toFixed(0);

  // Intelligence Badges Logic
  const badges = [];
  if (confidenceScore > 0.75) badges.push({ icon: Zap, label: "High Win Rate", color: "amber" });
  if (estimatedSavings > 50) badges.push({ icon: Trophy, label: "Big Saver", color: "emerald" });
  if (category === "utilities" || category === "internet") badges.push({ icon: Target, label: "Easy Target", color: "cyan" });
  
  const handleAutopilotToggle = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('bill_negotiation_opportunities')
        .update({ 
          metadata: { ...metadata, autopilot_enabled: enabled }
        })
        .eq('id', id);

      if (error) throw error;
      
      setAutopilotEnabled(enabled);
      toast.success(enabled ? 'AI Autopilot enabled' : 'AI Autopilot disabled');
    } catch (error) {
      console.error('Error updating autopilot:', error);
      toast.error('Failed to update autopilot setting');
    }
  };
  
  return (
    <GlassPanel className="p-6 space-y-4 hover:shadow-glass-elevated transition-all">
      {/* Header with Badges */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-xl text-foreground">{merchant}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                {category}
              </Badge>
            )}
            {badges.map((badge, idx) => (
              <Badge 
                key={idx}
                variant="outline" 
                className="text-xs border-secondary text-foreground/70"
              >
                <badge.icon className="w-3 h-3 mr-1" />
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Current</div>
          <div className="text-2xl font-bold text-foreground">
            ${currentAmount.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">/mo</div>
        </div>
      </div>
      
      {/* Savings Highlight */}
      <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
        <TrendingDown className="w-6 h-6 text-success flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-semibold text-success/80 mb-1 uppercase tracking-wide">
            Potential Savings
          </div>
          <div className="text-3xl font-bold text-success">
            ${estimatedSavings.toFixed(2)}
          </div>
        </div>
        <Badge variant="outline" className="text-success border-success/50 text-lg">
          {savingsPercentage}%
        </Badge>
      </div>
      
      {/* Confidence Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground uppercase tracking-wide">Confidence Score</span>
          <span className="text-foreground">{(confidenceScore * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-500"
            style={{ width: `${confidenceScore * 100}%` }}
          />
        </div>
      </div>

      {/* Autopilot Toggle */}
      <AutopilotToggle 
        enabled={autopilotEnabled}
        onToggle={handleAutopilotToggle}
      />
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button 
          onClick={onGenerateScript}
          variant="outline"
          className="border-border hover:bg-secondary/20"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Get Script
        </Button>
        <Button 
          onClick={onRequestNegotiation}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Negotiate
        </Button>
      </div>
    </GlassPanel>
  );
}