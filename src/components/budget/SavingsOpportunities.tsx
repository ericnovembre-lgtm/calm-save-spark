import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lightbulb, TrendingDown, ArrowRight } from "lucide-react";
import { fadeInUp } from "@/lib/motion-variants";
import { useSavingsOpportunities } from "@/hooks/useSavingsOpportunities";

interface SavingsOpportunitiesProps {
  budgets: any[];
  spending: Record<string, any>;
}

export function SavingsOpportunities({ budgets, spending }: SavingsOpportunitiesProps) {
  const opportunities = useSavingsOpportunities(budgets, spending);

  if (opportunities.length === 0) {
    return null;
  }

  const totalPotentialSavings = opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">Savings Opportunities</h3>
            <p className="text-sm text-muted-foreground">
              Potential savings: <span className="font-semibold text-primary">${totalPotentialSavings.toFixed(0)}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-4 h-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm">{opportunity.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        opportunity.confidence === 'high' ? 'border-primary text-primary' :
                        opportunity.confidence === 'medium' ? 'border-orange-500 text-orange-500' :
                        'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {opportunity.confidence}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {opportunity.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <ArrowRight className="w-3 h-3" />
                      {opportunity.action}
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      Save ${opportunity.potentialSavings.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
