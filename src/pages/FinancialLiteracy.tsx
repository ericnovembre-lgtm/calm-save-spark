import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Award, TrendingUp, Building2, Users, Globe } from "lucide-react";
import { CourseList } from "@/components/literacy/CourseList";
import { MyCourses } from "@/components/literacy/MyCourses";
import { MyCertificates } from "@/components/literacy/MyCertificates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function FinancialLiteracy() {
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  
  const { data: stats } = useQuery({
    queryKey: ['literacy-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [courses, progress, certificates] = await Promise.all([
        supabase.from('literacy_courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('user_course_progress').select('*', { count: 'exact', head: true }),
        supabase.from('course_certificates').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalCourses: courses.count || 0,
        inProgress: progress.count || 0,
        certificates: certificates.count || 0,
      };
    },
  });

  const audiences = [
    { id: "all", name: "All Audiences", icon: Globe },
    { id: "students", name: "Students", icon: BookOpen },
    { id: "families", name: "Families", icon: Users },
    { id: "government", name: "Government/NGO", icon: Building2 }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Financial Literacy Hub
          </h1>
          <p className="text-muted-foreground">
            Free educational resources for everyone • Powered by $ave+
          </p>
        </div>

        {/* Audience Selector */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Select Your Audience</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {audiences.map((audience) => (
                <Button
                  key={audience.id}
                  variant={selectedAudience === audience.id ? "default" : "outline"}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setSelectedAudience(audience.id)}
                >
                  <audience.icon className="w-6 h-6" />
                  <span className="text-sm">{audience.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Government/NGO Portal */}
        {selectedAudience === "government" && (
          <Card className="border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-4">
                <Building2 className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Government & NGO Programs</h3>
                  <p className="text-muted-foreground mb-4">
                    Deploy white-label financial literacy programs for your community, workforce, or constituents
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Community Programs</h4>
                      <p className="text-sm text-muted-foreground">Empower citizens with financial education</p>
                      <Badge variant="secondary">Free for public agencies</Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Workforce Development</h4>
                      <p className="text-sm text-muted-foreground">Train employees on personal finance</p>
                      <Badge variant="secondary">Bulk licensing available</Badge>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Social Services</h4>
                      <p className="text-sm text-muted-foreground">Support low-income families</p>
                      <Badge variant="secondary">Grant-funded options</Badge>
                    </div>
                  </div>
                  <Button className="mt-6">Request Program Information</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Courses</p>
                <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold">{stats?.certificates || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
            </TabsTrigger>
            <TabsTrigger value="mycourses">
              <TrendingUp className="w-4 h-4 mr-2" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <CourseList />
          </TabsContent>

          <TabsContent value="mycourses" className="mt-6">
            <MyCourses />
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <MyCertificates />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
