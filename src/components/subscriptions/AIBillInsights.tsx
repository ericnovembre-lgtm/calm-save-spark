import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, TrendingDown, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIBillInsightsProps {
  bills: Array<{
    id: string;
    name: string;
    amount: number;
    nextBilling: string;
  }>;
  selectedDate: string;
}

export function AIBillInsights({ bills, selectedDate }: AIBillInsightsProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      setError(false);
      
      try {
        const { data, error: functionError } = await supabase.functions.invoke(
          'analyze-bill-patterns',
          { body: { bills, selectedDate } }
        );

        if (functionError) throw functionError;
        setInsights(data.insights || "");
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError(true);
        setInsights("Your bills for this date total $" + bills.reduce((sum, b) => sum + b.amount, 0).toFixed(2) + ". Consider reviewing payment timing to optimize cash flow.");
      } finally {
        setLoading(false);
      }
    }

    if (bills.length > 0) {
      fetchInsights();
    } else {
      setLoading(false);
      setInsights("No bills scheduled for this date.");
    }
  }, [bills, selectedDate]);

  if (loading) {
    return (
      <Card className="p-4 space-y-3 bg-background/60 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="w-4 h-4 text-accent" />
          <span>AI Insights</span>
        </div>
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }

  const insightLines = insights.split('\n').filter(line => line.trim());

  return (
    <Card className="p-4 space-y-3 bg-background/60 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Lightbulb className="w-4 h-4 text-accent" />
        <span>AI Insights</span>
        {error && <span className="text-xs text-muted-foreground">(Fallback mode)</span>}
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        {insightLines.map((line, idx) => {
          const icon = line.includes('savings') || line.includes('save') ? TrendingDown :
                      line.includes('timing') || line.includes('schedule') ? Calendar :
                      Lightbulb;
          const Icon = icon;
          
          return (
            <div key={idx} className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
              <p className="leading-relaxed">{line}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
