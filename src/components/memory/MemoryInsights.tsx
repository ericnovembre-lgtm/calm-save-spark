import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Lightbulb, Bell, Award } from 'lucide-react';
import { useMemoryInsights } from '@/hooks/useMemoryInsights';

const insightIcons = {
  pattern: TrendingUp,
  recommendation: Lightbulb,
  reminder: Bell,
  achievement: Award,
};

const insightColors = {
  pattern: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  recommendation: 'bg-green-500/10 text-green-700 dark:text-green-300',
  reminder: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  achievement: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
};

export function MemoryInsights() {
  const { insights, isLoading } = useMemoryInsights();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Insights</CardTitle>
        <CardDescription>
          AI-generated insights from your financial history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No insights yet</p>
            </div>
          ) : (
            insights.map((insight, idx) => {
              const Icon = insightIcons[insight.type];
              const colorClass = insightColors[insight.type];

              return (
                <div
                  key={idx}
                  className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className={colorClass}>
                      <Icon className="h-3 w-3 mr-1" />
                      {insight.type}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${insight.importance * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
