import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BookOpen, Award, TrendingUp } from "lucide-react";
import { CourseList } from "@/components/literacy/CourseList";
import { MyCourses } from "@/components/literacy/MyCourses";
import { MyCertificates } from "@/components/literacy/MyCertificates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function FinancialLiteracy() {
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Financial Literacy
          </h1>
          <p className="text-muted-foreground">
            Learn essential financial skills through interactive courses
          </p>
        </div>

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
