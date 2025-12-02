import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionsOverview } from "@/components/defi/PositionsOverview";
import { YieldOptimizer } from "@/components/defi/YieldOptimizer";
import { RWAPortfolio } from "@/components/defi/RWAPortfolio";
import { ProtocolConnector } from "@/components/defi/ProtocolConnector";
import { TransactionHistory } from "@/components/defi/TransactionHistory";
import { Wallet, TrendingUp, Landmark, Link, History, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";

export default function DeFiManager() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">DeFi & RWA Manager</h1>
            <p className="text-muted-foreground">
              Autonomous yield optimization across Aave, Compound, and tokenized real-world assets
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Beta Feature:</strong> DeFi integration requires a real wallet connection. Demo mode simulates positions for testing purposes only.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <TabsTrigger value="positions">
                <Wallet className="mr-2 h-4 w-4" />
                Positions
              </TabsTrigger>
              <TabsTrigger value="optimizer">
                <TrendingUp className="mr-2 h-4 w-4" />
                Yield Optimizer
              </TabsTrigger>
              <TabsTrigger value="rwa">
                <Landmark className="mr-2 h-4 w-4" />
                RWA Portfolio
              </TabsTrigger>
              <TabsTrigger value="protocols">
                <Link className="mr-2 h-4 w-4" />
                Protocols
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-6">
              <PositionsOverview />
            </TabsContent>

            <TabsContent value="optimizer" className="mt-6">
              <YieldOptimizer />
            </TabsContent>

            <TabsContent value="rwa" className="mt-6">
              <RWAPortfolio />
            </TabsContent>

            <TabsContent value="protocols" className="mt-6">
              <ProtocolConnector />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
}
