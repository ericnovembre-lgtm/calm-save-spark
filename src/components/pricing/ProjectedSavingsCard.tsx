import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Zap } from "lucide-react";
import { getTierForAmount } from "./TierBadge";

interface ProjectedSavingsCardProps {
  selectedAmount: number;
}

export default function ProjectedSavingsCard({
  selectedAmount,
}: ProjectedSavingsCardProps) {
  const tier = getTierForAmount(selectedAmount);
  
  // Calculate projected savings based on tier features
  const calculateProjectedSavings = () => {
    let monthlyAutomation = 0;
    
    // Base round-ups (available at all paid tiers)
    if (selectedAmount >= 1) {
      monthlyAutomation += 15; // Average $15/month from round-ups
    }
    
    // Enhanced automation at higher tiers
    if (selectedAmount >= 4) {
      monthlyAutomation += 25; // Add rule-based savings
    }
    
    if (selectedAmount >= 8) {
      monthlyAutomation += 40; // Add smart goal optimization
    }
    
    if (selectedAmount >= 13) {
      monthlyAutomation += 60; // Add investment automation
    }
    
    if (selectedAmount >= 17) {
      monthlyAutomation += 80; // Add full portfolio management
    }
    
    return monthlyAutomation;
  };
  
  const monthlySavings = calculateProjectedSavings();
  const annualSavings = monthlySavings * 12;
  const annualCost = selectedAmount * 12;
  const netValue = annualSavings - annualCost;
  const roi = annualCost > 0 ? ((netValue / annualCost) * 100).toFixed(0) : 0;

  if (selectedAmount === 0) {
    return null; // Don't show for free tier
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Projected Annual Value with {tier.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Monthly Automation
            </div>
            <div className="text-2xl font-bold text-primary">
              ${monthlySavings}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              Annual Savings
            </div>
            <div className="text-2xl font-bold text-primary">
              ${annualSavings}
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Annual Cost</span>
            <span className="font-medium">${annualCost}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Automated Savings</span>
            <span className="font-medium text-primary">+${annualSavings}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Net Annual Value</span>
            <span className="text-primary">${netValue}</span>
          </div>
          <Badge variant="secondary" className="w-full justify-center mt-2">
            {roi}x ROI
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Estimates based on average user automation and savings patterns
        </p>
      </CardContent>
    </Card>
  );
}
