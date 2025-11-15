import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioOverviewProps {
  holdings: any[];
}

export function PortfolioOverview({ holdings }: PortfolioOverviewProps) {
  if (holdings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No portfolio holdings yet. Add your first holdings to start tracking.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Holdings</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">Gain/Loss</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => {
            const gainLoss = Number(holding.unrealized_gain_loss) || 0;
            const isPositive = gainLoss >= 0;
            
            return (
              <TableRow key={holding.id}>
                <TableCell className="font-medium">{holding.symbol}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {holding.asset_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{Number(holding.quantity).toFixed(4)}</TableCell>
                <TableCell className="text-right">
                  ${Number(holding.average_cost).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${Number(holding.current_price || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${Number(holding.market_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>
                      {isPositive ? '+' : ''}${Math.abs(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
