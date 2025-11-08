import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CourseList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['published-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('literacy_courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const startCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('user_course_progress')
        .insert({ course_id: courseId } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      toast.success("Course started! Check 'My Courses' to continue.");
    },
    onError: (error: any) => {
      toast.error(`Failed to start course: ${error.message}`);
    },
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading courses...</p>
        </Card>
      ) : courses?.length === 0 ? (
        <Card className="p-6 col-span-full">
          <p className="text-center text-muted-foreground">No courses available yet.</p>
        </Card>
      ) : (
        courses?.map((course) => (
          <Card key={course.id} className="p-4 flex flex-col">
            {course.thumbnail_url && (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
                  {course.difficulty_level}
                </Badge>
                <Badge variant="secondary">{course.category.replace(/_/g, ' ')}</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {course.description}
              </p>
              {course.duration_minutes && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_minutes} minutes</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => startCourse.mutate(course.id)}
              disabled={startCourse.isPending}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Course
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
