import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface RateMonitorProps {
  rates: any[];
}

export function RateMonitor({ rates }: RateMonitorProps) {
  if (rates.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No market rate data available</p>
      </Card>
    );
  }

  // Group rates by loan type
  const ratesByType = rates.reduce((acc: any, rate) => {
    if (!acc[rate.loan_type]) acc[rate.loan_type] = [];
    acc[rate.loan_type].push(rate);
    return acc;
  }, {});

  // Get latest rates
  const latestRates = Object.entries(ratesByType).map(([loanType, typeRates]: [string, any]) => {
    const latest = typeRates[0];
    return {
      loanType,
      rate: Number(latest.rate) * 100,
      apr: Number(latest.apr) * 100,
      source: latest.source,
      fetchedAt: latest.fetched_at,
    };
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Market Rates</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latestRates.map((rate) => (
            <Card key={rate.loanType} className="p-4">
              <p className="text-sm text-muted-foreground capitalize">
                {rate.loanType.replace('_', ' ')}
              </p>
              <p className="text-3xl font-bold mt-2">{rate.rate.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                APR: {rate.apr.toFixed(2)}%
              </p>
              <Badge variant="outline" className="mt-3">
                {rate.source}
              </Badge>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">30-Year Mortgage Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ratesByType.mortgage_30yr?.slice(0, 30).reverse() || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="effective_date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tickFormatter={(value) => `${(value * 100).toFixed(2)}%`}
            />
            <Tooltip 
              formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#8b5cf6" 
              name="Interest Rate" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
