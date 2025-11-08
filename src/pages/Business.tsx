import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Building2, Receipt, Users, FileText, TrendingUp } from "lucide-react";
import { BusinessExpenses } from "@/components/business/BusinessExpenses";
import { VendorManagement } from "@/components/business/VendorManagement";
import { InvoiceTracking } from "@/components/business/InvoiceTracking";
import { TaxReporting } from "@/components/business/TaxReporting";
import { BusinessProfile } from "@/components/business/BusinessProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Business() {
  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['business-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [expenses, vendors, invoices] = await Promise.all([
        supabase.from('business_expenses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      return {
        expensesCount: expenses.count || 0,
        vendorsCount: vendors.count || 0,
        invoicesCount: invoices.count || 0,
      };
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Business Management
          </h1>
          <p className="text-muted-foreground">
            Track expenses, manage vendors, and prepare for tax season
          </p>
        </div>

        {!profile && <BusinessProfile />}

        {profile && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Business</p>
                    <p className="text-2xl font-bold">{profile.business_name}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Receipt className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="text-2xl font-bold">{stats?.expensesCount || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendors</p>
                    <p className="text-2xl font-bold">{stats?.vendorsCount || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-orbital bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoices</p>
                    <p className="text-2xl font-bold">{stats?.invoicesCount || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="expenses">
                  <Receipt className="w-4 h-4 mr-2" />
                  Expenses
                </TabsTrigger>
                <TabsTrigger value="vendors">
                  <Users className="w-4 h-4 mr-2" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger value="invoices">
                  <FileText className="w-4 h-4 mr-2" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="tax">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Tax Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="mt-6">
                <BusinessExpenses businessProfileId={profile.id} />
              </TabsContent>

              <TabsContent value="vendors" className="mt-6">
                <VendorManagement businessProfileId={profile.id} />
              </TabsContent>

              <TabsContent value="invoices" className="mt-6">
                <InvoiceTracking businessProfileId={profile.id} />
              </TabsContent>

              <TabsContent value="tax" className="mt-6">
                <TaxReporting />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
