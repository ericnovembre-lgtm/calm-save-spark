import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Trophy, Gift, BarChart3 } from "lucide-react";
import { ChallengeManagement } from "@/components/admin/ChallengeManagement";
import { ReferralReview } from "@/components/admin/ReferralReview";
import { PlatformAnalytics } from "@/components/admin/PlatformAnalytics";
import { ExportButton } from "@/components/analytics/ExportButton";

export default function Admin() {
  // Sample admin export data
  const exportData = {
    title: "Admin Dashboard Report",
    headers: ["Metric", "Value", "Change"],
    rows: [
      ["Active Challenges", "8", "+2"],
      ["Pending Referrals", "24", "+5"],
      ["Total Users", "1,247", "+47"],
      ["API Requests", "45.2K", "+3.2K"],
    ],
    summary: [
      { label: "Report Date", value: new Date().toLocaleDateString() },
      { label: "Platform Status", value: "Operational" },
    ],
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage community challenges, referrals, and platform analytics
              </p>
            </div>
          </div>
          <ExportButton data={exportData} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Referrals</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Requests</p>
                <p className="text-2xl font-bold">45.2K</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="challenges">
              <Trophy className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Gift className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <ChallengeManagement />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <ReferralReview />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <PlatformAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}