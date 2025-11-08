import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, FileText, CreditCard, Database } from "lucide-react";
import { CryptoTracker } from "@/components/integrations/CryptoTracker";
import { TaxIntegration } from "@/components/integrations/TaxIntegration";
import { PaymentIntegration } from "@/components/integrations/PaymentIntegration";
import { OpenBankingSetup } from "@/components/integrations/OpenBankingSetup";

export default function Integrations() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect crypto wallets, tax software, payment providers, and banking APIs
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Bitcoin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crypto Assets</p>
                <p className="text-2xl font-bold">$2,450</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Documents</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Accounts</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-orbital bg-primary/10">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Accounts</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="crypto">
              <Bitcoin className="w-4 h-4 mr-2" />
              Cryptocurrency
            </TabsTrigger>
            <TabsTrigger value="tax">
              <FileText className="w-4 h-4 mr-2" />
              Tax Software
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="banking">
              <Database className="w-4 h-4 mr-2" />
              Open Banking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="space-y-4">
            <CryptoTracker />
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <TaxIntegration />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentIntegration />
          </TabsContent>

          <TabsContent value="banking" className="space-y-4">
            <OpenBankingSetup />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}