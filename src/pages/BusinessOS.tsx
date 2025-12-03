import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SCorpSetup } from "@/components/business-os/SCorpSetup";
import { BookkeepingIntegration } from "@/components/business-os/BookkeepingIntegration";
import { SyntheticPaycheck } from "@/components/business-os/SyntheticPaycheck";
import { TaxProjections } from "@/components/business-os/TaxProjections";
import { IncomeStreams } from "@/components/business-os/IncomeStreams";
import { BusinessExpenses } from "@/components/business/BusinessExpenses";
import { VendorManagement } from "@/components/business/VendorManagement";
import { InvoiceTracking } from "@/components/business/InvoiceTracking";
import { TaxReporting } from "@/components/business/TaxReporting";
import { BusinessProfile } from "@/components/business/BusinessProfile";
import { Building2, Calculator, DollarSign, FileText, TrendingUp, Receipt, Users } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

export default function BusinessOS() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'paycheck';

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

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Business-of-One OS</h1>
            <p className="text-muted-foreground">
              Manage your freelance business with S-Corp setup, synthetic paychecks, expenses, and automated tax planning
            </p>
          </div>

          {!profile && <BusinessProfile />}

          {profile && (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1">
                <TabsTrigger value="paycheck">
                  <DollarSign className="mr-2 h-4 w-4 hidden sm:inline" />
                  Paycheck
                </TabsTrigger>
                <TabsTrigger value="taxes">
                  <Calculator className="mr-2 h-4 w-4 hidden sm:inline" />
                  Tax Planning
                </TabsTrigger>
                <TabsTrigger value="income">
                  <TrendingUp className="mr-2 h-4 w-4 hidden sm:inline" />
                  Income
                </TabsTrigger>
                <TabsTrigger value="expenses">
                  <Receipt className="mr-2 h-4 w-4 hidden sm:inline" />
                  Expenses
                </TabsTrigger>
                <TabsTrigger value="vendors">
                  <Users className="mr-2 h-4 w-4 hidden sm:inline" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger value="invoices">
                  <FileText className="mr-2 h-4 w-4 hidden sm:inline" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="tax-reports">
                  <TrendingUp className="mr-2 h-4 w-4 hidden sm:inline" />
                  Tax Reports
                </TabsTrigger>
                <TabsTrigger value="bookkeeping">
                  <FileText className="mr-2 h-4 w-4 hidden sm:inline" />
                  Bookkeeping
                </TabsTrigger>
                <TabsTrigger value="setup">
                  <Building2 className="mr-2 h-4 w-4 hidden sm:inline" />
                  S-Corp
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paycheck" className="mt-6">
                <SyntheticPaycheck />
              </TabsContent>

              <TabsContent value="taxes" className="mt-6">
                <TaxProjections />
              </TabsContent>

              <TabsContent value="income" className="mt-6">
                <IncomeStreams />
              </TabsContent>

              <TabsContent value="expenses" className="mt-6">
                <BusinessExpenses businessProfileId={profile.id} />
              </TabsContent>

              <TabsContent value="vendors" className="mt-6">
                <VendorManagement businessProfileId={profile.id} />
              </TabsContent>

              <TabsContent value="invoices" className="mt-6">
                <InvoiceTracking businessProfileId={profile.id} />
              </TabsContent>

              <TabsContent value="tax-reports" className="mt-6">
                <TaxReporting />
              </TabsContent>

              <TabsContent value="bookkeeping" className="mt-6">
                <BookkeepingIntegration />
              </TabsContent>

              <TabsContent value="setup" className="mt-6">
                <SCorpSetup />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
