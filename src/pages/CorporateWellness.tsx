import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Users, TrendingUp, Award, DollarSign, 
  Target, Clock, BarChart3, UserPlus, Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const employeeMetrics = {
  totalEmployees: 247,
  activeUsers: 189,
  enrollmentRate: 76.5,
  avgHealthScore: 72,
  avgSavings: 8450,
  avgDebtReduction: 3200
};

const departments = [
  { name: "Engineering", employees: 85, enrollment: 82, avgScore: 75 },
  { name: "Sales", employees: 52, enrollment: 71, avgScore: 68 },
  { name: "Marketing", employees: 38, enrollment: 79, avgScore: 73 },
  { name: "Operations", employees: 42, enrollment: 75, avgScore: 70 },
  { name: "HR", employees: 18, enrollment: 89, avgScore: 78 },
  { name: "Finance", employees: 12, enrollment: 92, avgScore: 81 }
];

const recentActivity = [
  { employee: "J.Smith", department: "Engineering", action: "Completed onboarding", time: "2 hours ago" },
  { employee: "M.Johnson", department: "Sales", action: "Set first goal ($5k Emergency Fund)", time: "5 hours ago" },
  { employee: "A.Williams", department: "Marketing", action: "Linked bank account", time: "1 day ago" },
  { employee: "R.Davis", department: "Operations", action: "Completed financial health assessment", time: "1 day ago" }
];

const programBenefits = [
  {
    icon: TrendingUp,
    title: "Reduced Financial Stress",
    metric: "63% reduction",
    description: "Employees report significantly lower money-related anxiety"
  },
  {
    icon: Clock,
    title: "Increased Productivity",
    metric: "+18%",
    description: "Less time spent on personal financial issues during work"
  },
  {
    icon: Users,
    title: "Higher Retention",
    metric: "+24%",
    description: "Improved employee retention after program enrollment"
  },
  {
    icon: Award,
    title: "Better Engagement",
    metric: "4.8/5.0",
    description: "Employee satisfaction with benefits package"
  }
];

export default function CorporateWellness() {
  const { toast } = useToast();

  const handleInviteEmployees = () => {
    toast({
      title: "Invitations Sent",
      description: "Employee onboarding emails have been sent successfully.",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Generated",
      description: "Your quarterly wellness report is being prepared for download.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-display font-bold text-foreground">
                Corporate Wellness Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Employee Financial Wellness Program • ACME Corporation
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={handleInviteEmployees}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Employees
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employeeMetrics.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employeeMetrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {employeeMetrics.enrollmentRate}% enrolled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Health Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employeeMetrics.avgHealthScore}</div>
              <p className="text-xs text-green-600 mt-1">↑ 8 points vs Q4</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(employeeMetrics.avgSavings / 1000).toFixed(1)}k</div>
              <p className="text-xs text-green-600 mt-1">↑ $1.2k vs Q4</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Debt Reduced</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(employeeMetrics.avgDebtReduction / 1000).toFixed(1)}k</div>
              <p className="text-xs text-muted-foreground mt-1">Per employee</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Program ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3.2x</div>
              <p className="text-xs text-muted-foreground mt-1">Cost savings</p>
            </CardContent>
          </Card>
        </div>

        {/* Program Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {programBenefits.map((benefit, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <benefit.icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">{benefit.metric}</div>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="departments">By Department</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="goals">Program Goals</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          {/* Departments */}
          <TabsContent value="departments" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Enrollment & Performance</CardTitle>
                <CardDescription>Financial wellness metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{dept.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {dept.employees} employees • {dept.enrollment}% enrolled
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{dept.avgScore}</div>
                          <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${dept.enrollment}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="activity" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Employee Activity</CardTitle>
                <CardDescription>Latest program interactions (anonymized)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                          <span className="font-semibold text-sm">{activity.employee}</span>
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.department}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Program Goals */}
          <TabsContent value="goals" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Q1 2026 Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Enrollment Rate</span>
                      <span className="text-sm font-semibold">76.5% / 85%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Avg Health Score</span>
                      <span className="text-sm font-semibold">72 / 75</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-sm font-semibold">189 / 200</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '94.5%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Savings Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Program Investment</span>
                    <span className="font-semibold">$42,000/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated Productivity Gains</span>
                    <span className="font-semibold text-green-600">$89,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reduced Turnover Costs</span>
                    <span className="font-semibold text-green-600">$45,000</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-semibold">Total Net Benefit</span>
                    <span className="font-bold text-green-600 text-lg">$92,000</span>
                  </div>
                  <Badge className="w-full justify-center py-2" variant="default">
                    3.2x ROI
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="config" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Settings</CardTitle>
                <CardDescription>Configure your corporate wellness program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Enabled Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Financial Health Dashboard",
                      "Goal Setting & Tracking",
                      "AI Financial Coach",
                      "Debt Management Tools",
                      "Investment Education",
                      "Emergency Fund Builder"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 border rounded-lg">
                        <input type="checkbox" checked readOnly className="rounded" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Employer Contribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">401(k) Match</span>
                      <Badge>5% match up to 6%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">HSA Contribution</span>
                      <Badge>$1,000/year</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Student Loan Assistance</span>
                      <Badge>$200/month</Badge>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
