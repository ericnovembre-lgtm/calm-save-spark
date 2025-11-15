import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Award } from "lucide-react";

export function ROITracker() {
  const roiMetrics = [
    {
      label: "Program Cost",
      value: "$12,000",
      subtext: "Annual investment",
      icon: DollarSign,
      trend: null,
    },
    {
      label: "Employee Value",
      value: "$45,600",
      subtext: "Total savings generated",
      icon: Users,
      trend: "+23%",
    },
    {
      label: "ROI",
      value: "280%",
      subtext: "Return on investment",
      icon: TrendingUp,
      trend: "+15%",
    },
    {
      label: "Engagement Score",
      value: "87/100",
      subtext: "Employee satisfaction",
      icon: Award,
      trend: "+8pts",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Dashboard</CardTitle>
        <CardDescription>Track the value of your wellness program</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roiMetrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <metric.icon className="h-4 w-4" />
                {metric.label}
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{metric.subtext}</div>
                {metric.trend && (
                  <div className="text-xs font-medium text-green-600">{metric.trend}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Key Benefits</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 34% reduction in financial stress-related sick days</li>
              <li>• 28% increase in retirement plan participation</li>
              <li>• 45% of employees report improved financial confidence</li>
              <li>• 89% would recommend program to colleagues</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
