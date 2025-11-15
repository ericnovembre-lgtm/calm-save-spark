import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Fuel, Zap, Timer, Loader2 } from "lucide-react";

interface GasEstimatorProps {
  toAddress: string;
  amount: number;
  tokenSymbol: string;
  selectedSpeed: "slow" | "standard" | "fast";
  onSpeedChange: (speed: "slow" | "standard" | "fast") => void;
}

export function GasEstimator({ 
  toAddress, 
  amount, 
  tokenSymbol, 
  selectedSpeed,
  onSpeedChange 
}: GasEstimatorProps) {
  const { data: gasEstimate, isLoading } = useQuery({
    queryKey: ['gas-estimate', toAddress, amount, tokenSymbol],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('wallet-estimate-gas', {
        body: {
          to_address: toAddress,
          amount,
          token_symbol: tokenSymbol,
          speed: selectedSpeed,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!toAddress && !!amount,
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Estimating gas...</span>
        </div>
      </Card>
    );
  }

  if (!gasEstimate) return null;

  const speeds = gasEstimate.all_speeds;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Fuel className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Gas Fee</Label>
      </div>

      <RadioGroup value={selectedSpeed} onValueChange={onSpeedChange as any}>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="slow" id="slow" />
              <Label htmlFor="slow" className="cursor-pointer flex items-center gap-2">
                <Timer className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="font-medium">Slow</p>
                  <p className="text-xs text-muted-foreground">{speeds.slow.estimated_time}</p>
                </div>
              </Label>
            </div>
            <div className="text-right">
              <p className="font-semibold">${speeds.slow.total_usd.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {(speeds.slow.gas_limit * Number(speeds.slow.gas_price) / 1e18).toFixed(6)} ETH
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="cursor-pointer flex items-center gap-2">
                <Fuel className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">Standard</p>
                  <p className="text-xs text-muted-foreground">{speeds.standard.estimated_time}</p>
                </div>
              </Label>
            </div>
            <div className="text-right">
              <p className="font-semibold">${speeds.standard.total_usd.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {(speeds.standard.gas_limit * Number(speeds.standard.gas_price) / 1e18).toFixed(6)} ETH
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fast" id="fast" />
              <Label htmlFor="fast" className="cursor-pointer flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <div>
                  <p className="font-medium">Fast</p>
                  <p className="text-xs text-muted-foreground">{speeds.fast.estimated_time}</p>
                </div>
              </Label>
            </div>
            <div className="text-right">
              <p className="font-semibold">${speeds.fast.total_usd.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {(speeds.fast.gas_limit * Number(speeds.fast.gas_price) / 1e18).toFixed(6)} ETH
              </p>
            </div>
          </div>
        </div>
      </RadioGroup>
    </Card>
  );
}
