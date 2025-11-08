import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

export function MemberManagement({ organizationId }: { organizationId: string }) {
  const { data: members, isLoading } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Manage organization members and their roles
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading members...</p>
          </Card>
        ) : members?.length === 0 ? (
          <Card className="p-6 col-span-full">
            <p className="text-center text-muted-foreground">No members yet.</p>
          </Card>
        ) : (
          members?.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-orbital bg-primary/10">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Member</h3>
                  <Badge variant="outline" className="mt-2 capitalize">
                    {member.role}
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
