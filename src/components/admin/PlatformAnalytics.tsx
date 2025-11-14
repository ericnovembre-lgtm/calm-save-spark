import { Card } from "@/components/ui/card";
import { LazyBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "@/components/charts/LazyBarChart";
import { LazyLineChart, Line } from "@/components/charts/LazyLineChart";

export function PlatformAnalytics() {
  // Mock analytics data
  const userGrowthData = [
    { month: 'Jan', users: 850, active: 680 },
    { month: 'Feb', users: 920, active: 750 },
    { month: 'Mar', users: 1050, active: 840 },
    { month: 'Apr', users: 1180, active: 950 },
    { month: 'May', users: 1247, active: 1020 },
  ];

  const featureUsageData = [
    { feature: 'Savings Goals', usage: 892 },
    { feature: 'AI Coach', usage: 645 },
    { feature: 'Bill Negotiation', usage: 423 },
    { feature: 'Crypto Tracking', usage: 234 },
    { feature: 'ESG Investments', usage: 178 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">User Growth</h3>
          <LazyLineChart data={userGrowthData} height={300}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
            <Line type="monotone" dataKey="active" stroke="hsl(var(--accent))" strokeWidth={2} />
          </LazyLineChart>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Feature Usage</h3>
          <LazyBarChart data={featureUsageData} layout="vertical" height={300}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="feature" type="category" className="text-xs" width={120} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
          </LazyBarChart>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Savings</h4>
          <p className="text-3xl font-bold">$2.4M</p>
          <p className="text-sm text-green-600 mt-1">+18% from last month</p>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Active Challenges</h4>
          <p className="text-3xl font-bold">8</p>
          <p className="text-sm text-muted-foreground mt-1">456 participants</p>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Avg Engagement</h4>
          <p className="text-3xl font-bold">82%</p>
          <p className="text-sm text-green-600 mt-1">+5% from last week</p>
        </Card>
      </div>
    </div>
  );
}