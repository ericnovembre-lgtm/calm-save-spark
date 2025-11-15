import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

interface DepartmentData {
  name: string;
  employees: number;
  activeUsers: number;
  avgSavings: number;
  goalCompletion: number;
}

const departmentData: DepartmentData[] = [
  { name: "Engineering", employees: 45, activeUsers: 42, avgSavings: 1250, goalCompletion: 78 },
  { name: "Sales", employees: 32, activeUsers: 28, avgSavings: 980, goalCompletion: 65 },
  { name: "Marketing", employees: 18, activeUsers: 16, avgSavings: 1100, goalCompletion: 72 },
  { name: "Operations", employees: 25, activeUsers: 23, avgSavings: 890, goalCompletion: 68 },
];

export function DepartmentAnalytics() {
  return (
    <div className="space-y-4">
      {departmentData.map((dept) => (
        <Card key={dept.name}>
          <CardHeader>
            <CardTitle>{dept.name}</CardTitle>
            <CardDescription>
              {dept.activeUsers}/{dept.employees} active users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Engagement
                </div>
                <div className="text-2xl font-bold">
                  {Math.round((dept.activeUsers / dept.employees) * 100)}%
                </div>
                <Progress value={(dept.activeUsers / dept.employees) * 100} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Avg Savings
                </div>
                <div className="text-2xl font-bold">
                  ${dept.avgSavings.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">per employee</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Goals
                </div>
                <div className="text-2xl font-bold">{dept.goalCompletion}%</div>
                <Progress value={dept.goalCompletion} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Trend
                </div>
                <div className="text-2xl font-bold text-green-600">+12%</div>
                <div className="text-xs text-muted-foreground">vs last month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
