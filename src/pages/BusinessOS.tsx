import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SCorpSetup } from "@/components/business-os/SCorpSetup";
import { BookkeepingIntegration } from "@/components/business-os/BookkeepingIntegration";
import { SyntheticPaycheck } from "@/components/business-os/SyntheticPaycheck";
import { TaxProjections } from "@/components/business-os/TaxProjections";
import { IncomeStreams } from "@/components/business-os/IncomeStreams";
import { Building2, Calculator, DollarSign, FileText, TrendingUp } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";

export default function BusinessOS() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Business-of-One OS</h1>
            <p className="text-muted-foreground">
              Manage your freelance business with S-Corp setup, synthetic paychecks, and automated tax planning
            </p>
          </div>

          <Tabs defaultValue="paycheck" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <TabsTrigger value="paycheck">
                <DollarSign className="mr-2 h-4 w-4" />
                Paycheck
              </TabsTrigger>
              <TabsTrigger value="taxes">
                <Calculator className="mr-2 h-4 w-4" />
                Tax Planning
              </TabsTrigger>
              <TabsTrigger value="income">
                <TrendingUp className="mr-2 h-4 w-4" />
                Income Streams
              </TabsTrigger>
              <TabsTrigger value="bookkeeping">
                <FileText className="mr-2 h-4 w-4" />
                Bookkeeping
              </TabsTrigger>
              <TabsTrigger value="setup">
                <Building2 className="mr-2 h-4 w-4" />
                S-Corp Setup
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

            <TabsContent value="bookkeeping" className="mt-6">
              <BookkeepingIntegration />
            </TabsContent>

            <TabsContent value="setup" className="mt-6">
              <SCorpSetup />
            </TabsContent>
          </Tabs>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
