import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface ForecastData {
  month: string;
  actual?: number;
  predicted: number;
  confidence: { lower: number; upper: number };
  category?: string;
}

interface PredictiveSpendingForecastProps {
  category: string;
  historicalData: ForecastData[];
  predictions: ForecastData[];
  insights: {
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: 'low' | 'medium' | 'high';
    anomalies: string[];
    recommendations: string[];
  };
}

export function PredictiveSpendingForecast({
  category,
  historicalData,
  predictions,
  insights
}: PredictiveSpendingForecastProps) {
  const [showConfidence, setShowConfidence] = useState(true);

  const allData = [...historicalData, ...predictions];
  const maxValue = Math.max(...allData.map(d => d.predicted));
  const avgPredicted = predictions.reduce((sum, d) => sum + d.predicted, 0) / predictions.length;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {category} Spending Forecast
            {insights.trend === 'increasing' && <TrendingUp className="h-5 w-5 text-red-500" />}
            {insights.trend === 'decreasing' && <TrendingDown className="h-5 w-5 text-green-500" />}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            ML-powered predictions with {insights.volatility} volatility
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfidence(!showConfidence)}
        >
          {showConfidence ? 'Hide' : 'Show'} Confidence
        </Button>
      </div>

      {/* Forecast Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={allData}>
            <defs>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            
            {/* Confidence band */}
            {showConfidence && (
              <Area
                type="monotone"
                dataKey="confidence.upper"
                stroke="none"
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
              />
            )}
            
            {/* Actual historical data */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--muted-foreground))', r: 4 }}
            />
            
            {/* Predicted data */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-accent/5 border"
        >
          <p className="text-sm text-muted-foreground">Avg. Predicted</p>
          <p className="text-2xl font-bold">${avgPredicted.toFixed(0)}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-accent/5 border"
        >
          <p className="text-sm text-muted-foreground">Trend</p>
          <p className="text-2xl font-bold capitalize">{insights.trend}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-accent/5 border"
        >
          <p className="text-sm text-muted-foreground">Volatility</p>
          <p className="text-2xl font-bold capitalize">{insights.volatility}</p>
        </motion.div>
      </div>

      {/* Anomalies */}
      {insights.anomalies.length > 0 && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm">Detected Anomalies</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {insights.anomalies.map((anomaly, idx) => (
                  <li key={idx}>• {anomaly}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">AI Recommendations</h4>
        <div className="space-y-2">
          {insights.recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm"
            >
              {rec}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
