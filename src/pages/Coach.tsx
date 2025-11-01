import { Bot, Sparkles, Target, TrendingUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIChat } from "@/components/coach/AIChat";

/**
 * Coach page - AI-powered financial coaching and insights
 * SEO optimized for financial coaching and AI assistance
 */
const Coach = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* SEO Meta */}
        <title>AI Financial Coach | $ave+</title>
        <meta 
          name="description" 
          content="Get personalized financial coaching powered by AI. Receive insights, tips, and recommendations to optimize your savings and reach your goals faster." 
        />

        {/* Header */}
        <header>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">AI Financial Coach</h1>
              <p className="text-muted-foreground">
                Personalized insights and recommendations for smarter saving
              </p>
            </div>
          </div>
        </header>

        {/* Overview Cards */}
        <section className="grid md:grid-cols-3 gap-4" aria-label="Coaching statistics">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sessions This Month</CardDescription>
              <CardTitle className="text-3xl">8</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI coaching conversations
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
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-xl font-semibold mb-4 text-foreground">
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
              onClick={() => navigate('/budget')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Budget Manager
            </Button>
          </div>
        </section>

        {/* AI Chat */}
        <section aria-labelledby="chat-heading">
          <h2 id="chat-heading" className="text-xl font-semibold mb-4 text-foreground">
            Chat with Your Financial Coach
          </h2>
          <AIChat />
        </section>
      </div>
    </AppLayout>
  );
};

export default Coach;
