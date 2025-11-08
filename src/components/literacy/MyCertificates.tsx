import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Download } from "lucide-react";
import { format } from "date-fns";

export function MyCertificates() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['user-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_certificates')
        .select('*, literacy_courses(*)')
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading certificates...</p>
        </Card>
      ) : certificates?.length === 0 ? (
        <Card className="p-6 col-span-full">
          <p className="text-center text-muted-foreground">
            No certificates yet. Complete courses to earn your first certificate!
          </p>
        </Card>
      ) : (
        certificates?.map((cert) => (
          <Card key={cert.id} className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-orbital bg-yellow-100 dark:bg-yellow-900">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{cert.literacy_courses?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Certificate #{cert.certificate_number}
                </p>
                <Badge variant="secondary" className="mt-2">
                  Issued: {format(new Date(cert.issued_at), 'MMM d, yyyy')}
                </Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
