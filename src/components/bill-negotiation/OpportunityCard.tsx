import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown } from "lucide-react";

interface OpportunityCardProps {
  merchant: string;
  category?: string;
  currentAmount: number;
  estimatedSavings: number;
  confidenceScore: number;
  onRequestNegotiation: () => void;
}

export function OpportunityCard({
  merchant,
  category,
  currentAmount,
  estimatedSavings,
  confidenceScore,
  onRequestNegotiation,
}: OpportunityCardProps) {
  const savingsPercentage = ((estimatedSavings / currentAmount) * 100).toFixed(0);
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1">{merchant}</h3>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Current</div>
          <div className="text-xl font-bold text-foreground">
            ${currentAmount.toFixed(2)}/mo
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 rounded-lg">
        <TrendingDown className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-700 dark:text-green-400">
            Potential Savings
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            ${estimatedSavings.toFixed(2)}/mo
          </div>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          ~{savingsPercentage}% off
        </Badge>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Confidence: {(confidenceScore * 100).toFixed(0)}%
        </span>
        <div className="h-2 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${confidenceScore * 100}%` }}
          />
        </div>
      </div>
      
      <Button onClick={onRequestNegotiation} className="w-full">
        <DollarSign className="w-4 h-4 mr-2" />
        Request Negotiation
      </Button>
    </Card>
  );
}