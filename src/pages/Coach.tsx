import { Bot, Sparkles, Target, TrendingUp, Lightbulb, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";

interface Insight {
  id: string;
  type: 'tip' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const recentInsights: Insight[] = [
  {
    id: '1',
    type: 'suggestion',
    title: 'Consider Increasing Your Monthly Savings',
    description: 'Based on your spending patterns, you could safely increase your monthly savings by 15% without impacting your lifestyle.',
    date: '2 hours ago',
    priority: 'high',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Savings Streak: 30 Days!',
    description: 'Congratulations! You\'ve maintained consistent savings for 30 days straight.',
    date: '1 day ago',
    priority: 'low',
  },
  {
    id: '3',
    type: 'tip',
    title: 'Optimize Your Automation Rules',
    description: 'Your round-up automation could be enhanced by adding a weekly cap to prevent over-saving during busy weeks.',
    date: '2 days ago',
    priority: 'medium',
  },
  {
    id: '4',
    type: 'suggestion',
    title: 'Emergency Fund Recommendation',
    description: 'Your emergency fund is below the recommended 3-month threshold. Consider allocating more towards this goal.',
    date: '3 days ago',
    priority: 'high',
  },
];

const iconMap = {
  tip: Lightbulb,
  achievement: Sparkles,
  suggestion: Target,
};

const priorityColors = {
  high: 'destructive',
  medium: 'secondary',
  low: 'default',
};

/**
 * Coach page - AI-powered financial coaching and insights
 * SEO optimized for financial coaching and AI assistance
 */
const Coach = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* SEO Meta */}
      <title>AI Financial Coach | $ave+</title>
      <meta 
        name="description" 
        content="Get personalized financial coaching powered by AI. Receive insights, tips, and recommendations to optimize your savings and reach your goals faster." 
      />

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Financial Coach</h1>
            <p className="text-muted-foreground">
              Personalized insights and recommendations for smarter saving
            </p>
          </div>
        </div>
      </header>

      {/* Overview Cards */}
      <section className="grid md:grid-cols-3 gap-4 mb-8" aria-label="Coaching statistics">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Insights</CardDescription>
            <CardTitle className="text-3xl">{recentInsights.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Personalized recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Actions Taken</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Improvements implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Savings Optimized</CardDescription>
            <CardTitle className="text-3xl">+18%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Increase from coaching
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="mb-8" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-xl font-semibold mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => navigate('/goals')}
          >
            <Target className="w-5 h-5 mr-2" />
            Review Goals
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => navigate('/automations')}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Optimize Automations
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => navigate('/insights')}
          >
            <Lightbulb className="w-5 h-5 mr-2" />
            View Insights
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={() => navigate('/analytics')}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Analytics Dashboard
          </Button>
        </div>
      </section>

      {/* Recent Insights */}
      <section aria-labelledby="insights-heading">
        <h2 id="insights-heading" className="text-xl font-semibold mb-4">
          Recent Insights
        </h2>
        <div className="space-y-4">
          {recentInsights.map((insight) => {
            const Icon = iconMap[insight.type];
            return (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 mt-1">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={priorityColors[insight.priority] as any} className="text-xs">
                            {insight.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {insight.date}
                          </span>
                        </div>
                        <CardTitle className="text-lg mb-1">
                          {insight.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                    {insight.type === 'achievement' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-12 p-6 rounded-xl bg-muted/50" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          How AI Coaching Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-medium mb-2">1. Analyze</h3>
            <p className="text-muted-foreground">
              Our AI continuously analyzes your spending patterns, income, and savings goals to understand your financial behavior.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">2. Recommend</h3>
            <p className="text-muted-foreground">
              Based on your data, receive personalized recommendations to optimize your savings strategy and reach goals faster.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">3. Improve</h3>
            <p className="text-muted-foreground">
              Take action on insights and watch your financial health improve with trackable metrics and progress indicators.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Coach Widget */}
      <SaveplusCoachWidget />
    </div>
  );
};

export default Coach;
