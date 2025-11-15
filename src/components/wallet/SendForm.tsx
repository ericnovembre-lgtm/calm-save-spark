import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TokenSelector } from "./TokenSelector";
import { GasEstimator } from "./GasEstimator";
import { X, Send } from "lucide-react";
import { toast } from "sonner";

interface SendFormProps {
  onClose: () => void;
}

export function SendForm({ onClose }: SendFormProps) {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [gasSpeed, setGasSpeed] = useState<"slow" | "standard" | "fast">("standard");
  const [isSending, setIsSending] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ['user-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('chain', 'ethereum')
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSend = async () => {
    if (!wallet) {
      toast.error('Wallet not found');
      return;
    }

    if (!toAddress || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // First estimate gas
      const gasResponse = await supabase.functions.invoke('wallet-estimate-gas', {
        body: {
          to_address: toAddress,
          amount: parseFloat(amount),
          token_symbol: selectedToken,
          speed: gasSpeed,
        },
      });

      if (gasResponse.error) throw gasResponse.error;

      // Then broadcast transaction
      const broadcastResponse = await supabase.functions.invoke('wallet-broadcast', {
        body: {
          wallet_id: wallet.id,
          to_address: toAddress,
          amount: parseFloat(amount),
          token_symbol: selectedToken,
          gas_limit: gasResponse.data.estimate.gas_limit,
          gas_price: gasResponse.data.estimate.gas_price,
        },
      });

      if (broadcastResponse.error) throw broadcastResponse.error;

      toast.success('Transaction sent! Check transaction history for status.');
      setToAddress("");
      setAmount("");
      onClose();
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast.error('Failed to send transaction');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Send Crypto</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="token">Token</Label>
          <TokenSelector 
            value={selectedToken} 
            onChange={setSelectedToken} 
          />
        </div>

        <div>
          <Label htmlFor="to-address">Recipient Address</Label>
          <Input
            id="to-address"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {toAddress && amount && (
          <GasEstimator
            toAddress={toAddress}
            amount={parseFloat(amount)}
            tokenSymbol={selectedToken}
            selectedSpeed={gasSpeed}
            onSpeedChange={setGasSpeed}
          />
        )}

        <Button 
          onClick={handleSend} 
          disabled={isSending || !toAddress || !amount}
          className="w-full"
          size="lg"
        >
          <Send className="mr-2 h-5 w-5" />
          {isSending ? 'Sending...' : 'Send Transaction'}
        </Button>
      </div>
    </Card>
  );
}
