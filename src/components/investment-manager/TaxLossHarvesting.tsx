import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Receipt } from 'lucide-react';

interface TaxLossHarvestingProps {
  opportunities: any[];
}

export function TaxLossHarvesting({ opportunities }: TaxLossHarvestingProps) {
  if (opportunities.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
        <div>
          <h3 className="text-lg font-semibold">All Clear!</h3>
          <p className="text-muted-foreground mt-2">
            No tax-loss harvesting opportunities detected at this time.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-green-500/5 border-green-500/20">
        <div className="flex items-start gap-4">
          <Receipt className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Potential Tax Savings Available</h3>
            <p className="text-muted-foreground mt-1">
              We've identified {opportunities.length} tax-loss harvesting opportunities that could save you{' '}
              <span className="font-bold text-green-600">
                ${opportunities.reduce((sum, o) => sum + Number(o.potential_tax_savings), 0).toLocaleString()}
              </span>{' '}
              in taxes this year.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold">{opportunity.symbol}</h4>
                  {opportunity.wash_sale_risk && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Wash Sale Risk
                    </Badge>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Current Loss:{' '}
                    <span className="font-semibold text-red-600">
                      -${Math.abs(Number(opportunity.current_loss)).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Potential Tax Savings:{' '}
                    <span className="font-semibold text-green-600">
                      ${Number(opportunity.potential_tax_savings).toLocaleString()}
                    </span>
                  </p>
                  {opportunity.replacement_symbol && (
                    <p className="text-muted-foreground">
                      Suggested Replacement: <span className="font-semibold">{opportunity.replacement_symbol}</span>
                    </p>
                  )}
                  {opportunity.wash_sale_risk && opportunity.wash_sale_date && (
                    <p className="text-xs text-yellow-600">
                      ⚠️ Wait until {new Date(opportunity.wash_sale_date).toLocaleDateString()} to avoid wash sale
                    </p>
                  )}
                </div>
              </div>
              <Button size="sm" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Execute Harvest
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
