import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Building2, Palette, Key, Users } from "lucide-react";
import { OrganizationSetup } from "@/components/whitelabel/OrganizationSetup";
import { BrandingCustomization } from "@/components/whitelabel/BrandingCustomization";
import { APIKeyManagement } from "@/components/whitelabel/APIKeyManagement";
import { MemberManagement } from "@/components/whitelabel/MemberManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function WhiteLabel() {
  const { data: organization } = useQuery({
    queryKey: ['my-organization'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('organizations')
        .select('*, organization_branding(*)')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            White-Label Solutions
          </h1>
          <p className="text-muted-foreground">
            Customize and embed $ave+ for your organization
          </p>
        </div>

        {!organization ? (
          <OrganizationSetup />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="text-2xl font-bold">{organization.name}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="text-2xl font-bold capitalize">{organization.plan_type}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold">{organization.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="branding">
                  <Palette className="w-4 h-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="api">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users className="w-4 h-4 mr-2" />
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="mt-6">
                <BrandingCustomization organizationId={organization.id} />
              </TabsContent>

              <TabsContent value="api" className="mt-6">
                <APIKeyManagement organizationId={organization.id} />
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <MemberManagement organizationId={organization.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
