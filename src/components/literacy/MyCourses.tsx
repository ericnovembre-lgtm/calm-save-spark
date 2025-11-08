import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Award } from "lucide-react";

export function MyCourses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*, literacy_courses(*)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading your courses...</p>
        </Card>
      ) : courses?.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No courses in progress. Browse available courses to get started!
          </p>
        </Card>
      ) : (
        courses?.map((progress) => (
          <Card key={progress.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-orbital bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{progress.literacy_courses?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {progress.literacy_courses?.category.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              {progress.progress_percentage === 100 && (
                <Badge variant="default" className="bg-green-500">
                  <Award className="w-4 h-4 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{progress.progress_percentage}%</span>
              </div>
              <Progress value={progress.progress_percentage} />
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="default" className="flex-1">
                Continue Learning
              </Button>
              {progress.progress_percentage === 100 && (
                <Button variant="outline">
                  <Award className="w-4 h-4 mr-2" />
                  Get Certificate
                </Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
