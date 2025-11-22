import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { Suspense, lazy } from "react";
import { Sparkles, Brain, Bot } from "lucide-react";

const ProactiveRecommendations = lazy(() => import("@/components/dashboard/ProactiveRecommendations"));
const AIAgentsCard = lazy(() => import("@/components/dashboard/AIAgentsCard").then(m => ({ default: m.AIAgentsCard })));

interface UnifiedAIInsightsProps {
  userId?: string;
}

export function UnifiedAIInsights({ userId }: UnifiedAIInsightsProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Tips</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-4">
          <AIInsightsCard />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <Suspense fallback={
            <div className="h-48 rounded-lg bg-muted/50 animate-pulse" />
          }>
            {userId && <ProactiveRecommendations userId={userId} />}
          </Suspense>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Suspense fallback={
            <div className="h-48 rounded-lg bg-muted/50 animate-pulse" />
          }>
            <AIAgentsCard />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
