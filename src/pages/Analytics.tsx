import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, FileText } from "lucide-react";
import { SpendingChart } from "@/components/analytics/SpendingChart";
import { ForecastChart } from "@/components/analytics/ForecastChart";
import { ReportBuilder } from "@/components/analytics/ReportBuilder";
import { ForecastDashboard } from "@/components/analytics/ForecastDashboard";
import { BenchmarkComparison } from "@/components/analytics/BenchmarkComparison";

export default function Analytics() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Custom reports, AI forecasts, and benchmark comparisons
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custom Reports</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Forecasts</p>
                <p className="text-2xl font-bold">3 mo</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peer Percentile</p>
                <p className="text-2xl font-bold">75th</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Report Builder
            </TabsTrigger>
            <TabsTrigger value="forecasts">
              <TrendingUp className="w-4 h-4 mr-2" />
              AI Forecasts
            </TabsTrigger>
            <TabsTrigger value="benchmarks">
              <Users className="w-4 h-4 mr-2" />
              Benchmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <ReportBuilder />
            <SpendingChart />
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-4">
            <ForecastDashboard />
            <ForecastChart />
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-4">
            <BenchmarkComparison />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}