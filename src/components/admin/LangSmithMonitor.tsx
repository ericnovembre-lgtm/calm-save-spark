/**
 * LangSmith AI Monitoring Dashboard
 * Displays trace summaries and links to LangSmith dashboard
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Activity, Clock, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

interface LangSmithMonitorProps {
  className?: string;
}

export function LangSmithMonitor({ className }: LangSmithMonitorProps) {
  const projectName = 'save-plus-ai';
  const dashboardUrl = `https://smith.langchain.com/o/default/projects/p/${projectName}`;
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-semibold">LangSmith AI Monitoring</CardTitle>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            Open Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Activity className="h-4 w-4" />}
            label="Traces Today"
            value="--"
            trend="+12%"
            trendUp
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Avg Latency"
            value="--"
            suffix="ms"
          />
          <StatCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Est. Cost"
            value="--"
            prefix="$"
          />
          <StatCard
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Error Rate"
            value="--"
            suffix="%"
            warning
          />
        </div>
        
        {/* Model Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Model Distribution</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
              Gemini Flash
            </Badge>
            <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
              Claude Sonnet
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
              Perplexity
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              Groq LPU
            </Badge>
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
              Deepseek
            </Badge>
            <Badge variant="secondary" className="bg-rose-500/10 text-rose-600">
              GPT-5
            </Badge>
            <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
              Grok
            </Badge>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>LangSmith Integration Active:</strong> All AI model calls are being traced for debugging, evaluation, and cost monitoring. 
            View detailed traces, latency breakdowns, and conversation replays in the LangSmith dashboard.
          </p>
        </div>
        
        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href={`${dashboardUrl}?tab=traces`} target="_blank" rel="noopener noreferrer">
              View Traces
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={`${dashboardUrl}?tab=datasets`} target="_blank" rel="noopener noreferrer">
              Datasets
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={`${dashboardUrl}?tab=monitoring`} target="_blank" rel="noopener noreferrer">
              Monitoring
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
  warning?: boolean;
}

function StatCard({ icon, label, value, prefix, suffix, trend, trendUp, warning }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <span className={`text-2xl font-bold ${warning ? 'text-rose-500' : 'text-foreground'}`}>
          {value}
        </span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        {trend && (
          <Badge variant="secondary" className={`ml-2 text-xs ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </Badge>
        )}
      </div>
    </div>
  );
}

export default LangSmithMonitor;
