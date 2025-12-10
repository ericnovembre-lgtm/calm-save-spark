import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, Clock, Trash2, Scissors } from "lucide-react";
import { format } from "date-fns";
import { TaxLot } from "@/hooks/useTaxLots";

interface TaxLotCardProps {
  lot: TaxLot;
  onDelete: (id: string) => void;
  onHarvest?: (lot: TaxLot) => void;
}

export function TaxLotCard({ lot, onDelete, onHarvest }: TaxLotCardProps) {
  const gainLoss = lot.unrealized_gain_loss || (lot.current_price ? (lot.current_price - lot.purchase_price) * lot.quantity : 0);
  const gainLossPercent = lot.cost_basis > 0 ? (gainLoss / lot.cost_basis) * 100 : 0;
  const isGain = gainLoss >= 0;
  const isHarvestCandidate = gainLoss < 0 && !lot.is_sold;

  return (
    <Card className={`bg-card border-border ${isHarvestCandidate ? 'ring-1 ring-amber-500/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-foreground">{lot.symbol}</span>
              <Badge 
                variant="secondary" 
                className={lot.holding_period === 'long_term' 
                  ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                  : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                }
              >
                {lot.holding_period === 'long_term' ? 'Long Term' : 'Short Term'}
              </Badge>
              {isHarvestCandidate && (
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  <Scissors className="w-3 h-3 mr-1" />
                  Harvest Candidate
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {lot.quantity.toLocaleString()} shares @ ${lot.purchase_price.toFixed(2)}
            </p>
          </div>
          
          <div className={`text-right ${isGain ? 'text-green-600' : 'text-red-500'}`}>
            <div className="flex items-center gap-1 justify-end">
              {isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">
                {isGain ? '+' : ''}{gainLossPercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm font-medium">
              {isGain ? '+' : ''}${gainLoss.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <p className="text-muted-foreground">Cost Basis</p>
            <p className="font-medium text-foreground">${lot.cost_basis.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Value</p>
            <p className="font-medium text-foreground">
              ${lot.current_price 
                ? (lot.current_price * lot.quantity).toLocaleString() 
                : lot.cost_basis.toLocaleString()
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(lot.purchase_date), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lot.days_held} days held
            </span>
          </div>
          
          <div className="flex gap-2">
            {isHarvestCandidate && onHarvest && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onHarvest(lot)}
                className="text-amber-600 border-amber-500/50 hover:bg-amber-500/10"
              >
                <Scissors className="w-4 h-4 mr-1" />
                Harvest
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(lot.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {lot.account_name && (
          <p className="text-xs text-muted-foreground mt-2">
            Account: {lot.account_name}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
