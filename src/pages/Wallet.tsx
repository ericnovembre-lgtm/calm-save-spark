import { useState } from "react";
import { WalletOverview } from "@/components/wallet/WalletOverview";
import { SendForm } from "@/components/wallet/SendForm";
import { ReceiveModal } from "@/components/wallet/ReceiveModal";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

export default function Wallet() {
  const [showSendForm, setShowSendForm] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground">
          Send, receive, and manage your crypto assets
        </p>
      </div>

      <WalletOverview />

      <div className="flex gap-4 mb-8">
        <Button
          onClick={() => setShowSendForm(!showSendForm)}
          className="flex-1"
          size="lg"
        >
          <ArrowUpRight className="mr-2 h-5 w-5" />
          Send
        </Button>
        <Button
          onClick={() => setShowReceiveModal(true)}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <ArrowDownLeft className="mr-2 h-5 w-5" />
          Receive
        </Button>
      </div>

      {showSendForm && (
        <div className="mb-8">
          <SendForm onClose={() => setShowSendForm(false)} />
        </div>
      )}

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">
            <Clock className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-6">
          <TransactionHistory />
        </TabsContent>
        <TabsContent value="tokens" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            Token management coming soon
          </div>
        </TabsContent>
      </Tabs>

      <ReceiveModal 
        open={showReceiveModal} 
        onClose={() => setShowReceiveModal(false)} 
      />
    </div>
  );
}
