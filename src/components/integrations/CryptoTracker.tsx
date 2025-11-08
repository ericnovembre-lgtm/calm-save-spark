import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CryptoTracker() {
  const { data: holdings, refetch } = useQuery({
    queryKey: ['crypto-holdings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_holdings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const syncPrices = async () => {
    try {
      const { error } = await supabase.functions.invoke('sync-crypto-prices');
      if (error) throw error;
      
      toast.success("Crypto prices synced successfully");
      refetch();
    } catch (error: any) {
      toast.error(`Failed to sync prices: ${error.message}`);
    }
  };

  const totalValue = holdings?.reduce((sum, h) => {
    const current = parseFloat(h.current_price?.toString() || '0');
    const quantity = parseFloat(h.quantity.toString());
    return sum + (current * quantity);
  }, 0) || 0;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bitcoin className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Cryptocurrency Portfolio</h3>
              <p className="text-sm text-muted-foreground">
                Track your crypto investments
              </p>
            </div>
          </div>
          <Button onClick={syncPrices} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Prices
          </Button>
        </div>

        <div className="mb-6 p-4 bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
          <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
        </div>

        <div className="space-y-3">
          {holdings && holdings.length > 0 ? (
            holdings.map((holding) => {
              const currentPrice = parseFloat(holding.current_price?.toString() || '0');
              const purchasePrice = parseFloat(holding.purchase_price?.toString() || '0');
              const quantity = parseFloat(holding.quantity.toString());
              const value = currentPrice * quantity;
              const gain = ((currentPrice - purchasePrice) / purchasePrice) * 100;

              return (
                <div key={holding.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bitcoin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{holding.symbol}</p>
                      <p className="text-sm text-muted-foreground">{quantity} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${value.toFixed(2)}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {gain >= 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">+{gain.toFixed(2)}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-red-600" />
                          <span className="text-red-600">{gain.toFixed(2)}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bitcoin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No crypto holdings yet</p>
              <p className="text-sm mt-1">Connect your exchange or wallet to start tracking</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}