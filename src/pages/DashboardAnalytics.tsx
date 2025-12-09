import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useWidgetAnalyticsData } from '@/hooks/useWidgetAnalyticsData';
import { WidgetEngagementChart } from '@/components/dashboard/analytics/WidgetEngagementChart';
import { ActionClickThroughChart } from '@/components/dashboard/analytics/ActionClickThroughChart';
import { EngagementHeatmap } from '@/components/dashboard/analytics/EngagementHeatmap';
import { PreferencePatterns } from '@/components/dashboard/analytics/PreferencePatterns';
import { ArrowLeft, Eye, MousePointerClick, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';

export default function DashboardAnalytics() {
  const navigate = useNavigate();
  const { widgetEngagement, actionClickThrough, dailyEngagement, summary, isLoading } = useWidgetAnalyticsData(30);

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Dashboard Analytics</h1>
              <p className="text-sm text-muted-foreground">Widget engagement data for AI personalization</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">
                          <CountUp end={summary.totalViews} duration={1} />
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Total Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <MousePointerClick className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">
                          <CountUp end={summary.totalClicks} duration={1} />
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Total Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">
                          <CountUp end={summary.totalActions} duration={1} />
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Quick Actions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">
                          <CountUp end={Math.round(summary.avgSessionDuration / 1000)} duration={1} suffix="s" />
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Avg Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isLoading ? (
                <Card className="bg-card/50"><CardContent className="h-72"><Skeleton className="h-full" /></CardContent></Card>
              ) : (
                <WidgetEngagementChart data={widgetEngagement} />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {isLoading ? (
                <Card className="bg-card/50"><CardContent className="h-72"><Skeleton className="h-full" /></CardContent></Card>
              ) : (
                <ActionClickThroughChart data={actionClickThrough} />
              )}
            </motion.div>
          </div>

          {/* Heatmap & Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:col-span-2"
            >
              {isLoading ? (
                <Card className="bg-card/50"><CardContent className="h-48"><Skeleton className="h-full" /></CardContent></Card>
              ) : (
                <EngagementHeatmap data={dailyEngagement} />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {isLoading ? (
                <Card className="bg-card/50"><CardContent className="h-48"><Skeleton className="h-full" /></CardContent></Card>
              ) : (
                <PreferencePatterns data={widgetEngagement} />
              )}
            </motion.div>
          </div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-yellow-500/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  AI Personalization Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {!isLoading && summary.mostViewedWidget !== 'N/A' && (
                  <p>
                    • Your most viewed widget is <span className="text-foreground font-medium">{summary.mostViewedWidget.replace(/_/g, ' ')}</span> — 
                    Claude will prioritize this in your layout.
                  </p>
                )}
                {!isLoading && summary.mostClickedAction !== 'N/A' && (
                  <p>
                    • Top action: <span className="text-foreground font-medium">{summary.mostClickedAction.replace(/_/g, ' ')}</span> — 
                    Consider adding a shortcut for faster access.
                  </p>
                )}
                {!isLoading && summary.avgSessionDuration > 0 && (
                  <p>
                    • Average widget viewing time is {Math.round(summary.avgSessionDuration / 1000)}s — 
                    {summary.avgSessionDuration > 5000 ? ' Users engage deeply with content.' : ' Quick glances suggest need for more compact views.'}
                  </p>
                )}
                {isLoading && <Skeleton className="h-16" />}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
