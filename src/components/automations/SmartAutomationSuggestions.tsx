import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield, DollarSign, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSmartAutomations } from "@/hooks/useSmartAutomations";

const impactColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-accent text-accent-foreground"
};

const categoryIcons = {
  savings: DollarSign,
  'micro-savings': TrendingUp,
  optimization: Sparkles,
  protection: Shield
};

export function SmartAutomationSuggestions() {
  const { suggestions, isLoading, acceptSuggestion, dismissSuggestion } = useSmartAutomations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
        <p className="text-sm text-muted-foreground">
          We're analyzing your financial patterns. Check back soon!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Smart Suggestions</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered automation recommendations based on your behavior
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {suggestions.map((suggestion, index) => {
          const Icon = categoryIcons[suggestion.category as keyof typeof categoryIcons] || Sparkles;
          
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge variant="outline" className={impactColors[suggestion.impact]}>
                          {suggestion.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(suggestion.confidence * 100)}% confident
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {suggestion.description}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptSuggestion.mutate(suggestion)}
                        disabled={acceptSuggestion.isPending}
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Enable Automation
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissSuggestion.mutate(suggestion.id)}
                        disabled={dismissSuggestion.isPending}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}