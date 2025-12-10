import { Card } from '@/components/ui/card';
import { useInsightAnalytics } from '@/hooks/useInsightsArchive';
import { Lightbulb, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export function InsightImpactSummary() {
  const { data: analytics, isLoading } = useInsightAnalytics();

  if (isLoading || !analytics) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  const impactData = Object.entries(analytics.byImpact).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Insights Summary</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{analytics.total}</div>
          <div className="text-xs text-muted-foreground">Total Insights</div>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{analytics.actedOn}</div>
          <div className="text-xs text-muted-foreground">Actions Taken</div>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-gray-100">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{analytics.dismissed}</div>
          <div className="text-xs text-muted-foreground">Dismissed</div>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-blue-100">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{analytics.actionRate.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground">Action Rate</div>
        </div>
      </div>

      {impactData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">By Impact Level</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={impactData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {impactData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {impactData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}