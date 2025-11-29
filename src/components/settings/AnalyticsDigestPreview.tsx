import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Loader2, BarChart3, TrendingUp, TrendingDown, PieChart, Lightbulb, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function AnalyticsDigestPreview() {
  const [isSending, setIsSending] = useState(false);

  // Fetch recent spending data for preview
  const { data: spendingData } = useQuery({
    queryKey: ["spending-preview"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, category, transaction_date")
        .eq("user_id", user.id)
        .gte("transaction_date", weekAgo.toISOString().split("T")[0])
        .lt("amount", 0);

      if (!transactions || transactions.length === 0) {
        return {
          totalSpent: 0,
          categoryBreakdown: [],
          transactionCount: 0,
        };
      }

      const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Group by category
      const categoryMap = new Map<string, number>();
      transactions.forEach(t => {
        const cat = t.category || "Other";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
      });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: Math.round((amount / totalSpent) * 100),
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      return {
        totalSpent,
        categoryBreakdown,
        transactionCount: transactions.length,
      };
    },
  });

  const handleSendTestDigest = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-weekly-digests-batch", {
        body: { testMode: true },
      });

      if (error) throw error;
      
      toast.success("Test analytics digest sent! Check your email.");
    } catch (error) {
      console.error("Error sending test digest:", error);
      toast.error("Failed to send test digest. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const categoryColors: Record<string, string> = {
    Groceries: "bg-emerald-500",
    Dining: "bg-orange-500",
    Transportation: "bg-blue-500",
    Entertainment: "bg-purple-500",
    Utilities: "bg-yellow-500",
    Shopping: "bg-pink-500",
    Healthcare: "bg-red-500",
    Travel: "bg-cyan-500",
    Other: "bg-gray-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics Digest Preview
          </h3>
          <p className="text-sm text-muted-foreground">
            Preview what your weekly/monthly analytics digest will look like
          </p>
        </div>
        <Button
          onClick={handleSendTestDigest}
          disabled={isSending}
          size="sm"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </>
          )}
        </Button>
      </div>

      {/* Email Preview */}
      <Card className="border-2 border-dashed">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Mail className="w-3 h-3" />
            Email Preview
          </div>
          <CardTitle className="text-lg">📊 Your Weekly $ave+ Analytics Digest</CardTitle>
          <CardDescription>
            Here's your spending summary for the past week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Spending Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">
                ${spendingData?.totalSpent?.toFixed(2) || "0.00"}
              </p>
              <div className="flex items-center justify-center gap-1 text-xs mt-1">
                <TrendingUp className="w-3 h-3 text-destructive" />
                <span className="text-destructive">+12% vs last week</span>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
              <p className="text-2xl font-bold text-foreground">
                {spendingData?.transactionCount || 0}
              </p>
              <div className="flex items-center justify-center gap-1 text-xs mt-1">
                <TrendingDown className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">-5% vs last week</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Category Breakdown */}
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-primary" />
              Top Categories
            </h4>
            <div className="space-y-2">
              {(spendingData?.categoryBreakdown?.length ?? 0) > 0 ? (
                spendingData?.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[cat.category] || categoryColors.Other}`} />
                    <span className="flex-1 text-sm">{cat.category}</span>
                    <span className="text-sm text-muted-foreground">{cat.percentage}%</span>
                    <span className="text-sm font-medium">${cat.amount.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="flex-1 text-sm">Groceries</span>
                    <span className="text-sm text-muted-foreground">38%</span>
                    <span className="text-sm font-medium">$320.00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="flex-1 text-sm">Dining</span>
                    <span className="text-sm text-muted-foreground">23%</span>
                    <span className="text-sm font-medium">$198.50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="flex-1 text-sm">Entertainment</span>
                    <span className="text-sm text-muted-foreground">15%</span>
                    <span className="text-sm font-medium">$125.00</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* AI Insights */}
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              AI Insights
            </h4>
            <div className="space-y-2">
              <div className="bg-yellow-500/10 border-l-2 border-yellow-500 p-3 rounded-r-lg">
                <p className="text-sm">⚠️ Entertainment spending up 45% this week</p>
              </div>
              <div className="bg-blue-500/10 border-l-2 border-blue-500 p-3 rounded-r-lg">
                <p className="text-sm">💡 Consider meal prepping to reduce dining costs</p>
              </div>
              <div className="bg-emerald-500/10 border-l-2 border-emerald-500 p-3 rounded-r-lg">
                <p className="text-sm">✅ Groceries spending is on track with your budget</p>
              </div>
            </div>
          </div>

          {/* Budget Status */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Budget Progress</span>
              <span className="font-medium">42% used</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              $847 spent of $2,000 budget • $1,153 remaining
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
