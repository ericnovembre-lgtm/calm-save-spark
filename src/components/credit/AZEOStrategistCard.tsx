import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Loader2, Plus, X } from 'lucide-react';
import { useCreditCoach } from '@/hooks/useCreditCoach';
import { toast } from 'sonner';
import { LazyPieChart, Pie, Cell, Tooltip, Legend } from '@/components/charts/LazyPieChart';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function AZEOStrategistCard() {
  const [cardLimits, setCardLimits] = useState<string[]>(['', '']);
  const { mutate: calculateStrategy, data, isPending } = useCreditCoach();

  const totalLimit = cardLimits
    .filter(l => l !== '')
    .reduce((sum, limit) => sum + parseFloat(limit), 0);
  const targetAmount = Math.round(totalLimit * 0.01);

  const validLimits = cardLimits
    .filter(l => l !== '')
    .map(l => parseFloat(l));
  const maxLimit = validLimits.length > 0 ? Math.max(...validLimits) : 0;

  const chartData = cardLimits
    .map((limit, index) => ({
      name: `Card ${index + 1}`,
      value: limit !== '' ? parseFloat(limit) : 0,
      isRecommended: limit !== '' && parseFloat(limit) === maxLimit,
    }))
    .filter(d => d.value > 0);

  const handleAddCard = () => {
    if (cardLimits.length < 5) {
      setCardLimits([...cardLimits, '']);
    }
  };

  const handleRemoveCard = (index: number) => {
    if (cardLimits.length > 1) {
      setCardLimits(cardLimits.filter((_, i) => i !== index));
    }
  };

  const handleLimitChange = (index: number, value: string) => {
    const newLimits = [...cardLimits];
    newLimits[index] = value;
    setCardLimits(newLimits);
  };

  const handleCalculate = () => {
    const limits = cardLimits
      .filter(l => l !== '')
      .map(l => parseFloat(l));

    if (limits.length === 0) {
      toast.error('Please enter at least one card limit');
      return;
    }

    calculateStrategy({
      mode: 'azeo-strategist',
      data: { cardLimits: limits },
    }, {
      onSuccess: () => {
        toast.success('AZEO strategy calculated!');
      },
      onError: () => {
        toast.error('Failed to calculate strategy');
      },
    });
  };

  return (
    <Card className="backdrop-blur-glass bg-glass border-glass-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>AZEO Strategist</CardTitle>
            <CardDescription>Optimize for 1% utilization sweet spot</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {cardLimits.map((limit, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`card-${index}`}>Card {index + 1} Limit</Label>
                <Input
                  id={`card-${index}`}
                  type="number"
                  placeholder="5000"
                  value={limit}
                  onChange={(e) => handleLimitChange(index, e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              {cardLimits.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCard(index)}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {cardLimits.length < 5 && (
          <Button
            variant="outline"
            onClick={handleAddCard}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        )}

        {totalLimit > 0 && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Credit Limit:</span>
              <span className="font-medium">${totalLimit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target 1% Amount:</span>
              <span className="font-bold text-primary">${targetAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {chartData.length >= 2 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Credit Limit Distribution</p>
            <LazyPieChart height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent, isRecommended }) => (
                  `${name}: $${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)${isRecommended ? ' ★' : ''}`
                )}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isRecommended ? 'hsl(142, 76%, 36%)' : CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend 
                formatter={(value, entry: any) => 
                  `${value}${entry.payload.isRecommended ? ' (Recommended - Use This Card)' : ''}`
                }
              />
            </LazyPieChart>
          </div>
        )}

        <Button
          onClick={handleCalculate}
          disabled={isPending || totalLimit === 0}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Calculate AZEO Strategy'
          )}
        </Button>

        {data?.result && (
          <div className="p-4 rounded-lg bg-muted/20 border border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">Strategy:</p>
            <div className="text-sm whitespace-pre-wrap text-foreground/90">
              {data.result}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
