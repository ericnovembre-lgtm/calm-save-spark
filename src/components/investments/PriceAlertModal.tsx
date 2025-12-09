import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TrendingUp, TrendingDown, Percent } from "lucide-react";
import { toast } from "sonner";

interface PriceAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertCreated?: () => void;
  prefilledSymbol?: string;
  prefilledAssetName?: string;
  prefilledCurrentPrice?: number;
}

export function PriceAlertModal({
  open,
  onOpenChange,
  onAlertCreated,
  prefilledSymbol = "",
  prefilledAssetName = "",
  prefilledCurrentPrice,
}: PriceAlertModalProps) {
  const [symbol, setSymbol] = useState(prefilledSymbol);
  const [assetName, setAssetName] = useState(prefilledAssetName);
  const [alertType, setAlertType] = useState<'above' | 'below' | 'percent_change'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [percentThreshold, setPercentThreshold] = useState('');
  const [note, setNote] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(prefilledCurrentPrice || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSymbol(prefilledSymbol);
      setAssetName(prefilledAssetName);
      setCurrentPrice(prefilledCurrentPrice || null);
      
      // Fetch current price if not provided
      if (prefilledSymbol && !prefilledCurrentPrice) {
        fetchCurrentPrice(prefilledSymbol);
      }
    }
  }, [open, prefilledSymbol, prefilledAssetName, prefilledCurrentPrice]);

  const fetchCurrentPrice = async (sym: string) => {
    try {
      const { data } = await supabase
        .from('market_data_cache')
        .select('price')
        .eq('symbol', sym.toUpperCase())
        .single();

      if (data?.price) {
        const priceValue = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
        setCurrentPrice(priceValue);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const handleSubmit = async () => {
    if (!symbol.trim()) {
      toast.error('Please enter a symbol');
      return;
    }

    if (alertType !== 'percent_change' && !targetPrice) {
      toast.error('Please enter a target price');
      return;
    }

    if (alertType === 'percent_change' && !percentThreshold) {
      toast.error('Please enter a percent threshold');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const alertData: any = {
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        asset_name: assetName || null,
        alert_type: alertType,
        current_price_at_creation: currentPrice,
        note: note || null,
      };

      if (alertType === 'percent_change') {
        alertData.percent_threshold = parseFloat(percentThreshold);
      } else {
        alertData.target_price = parseFloat(targetPrice);
      }

      const { error } = await supabase
        .from('investment_price_alerts')
        .insert(alertData);

      if (error) throw error;

      toast.success('Price alert created successfully!');
      onAlertCreated?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSymbol('');
    setAssetName('');
    setAlertType('above');
    setTargetPrice('');
    setPercentThreshold('');
    setNote('');
    setCurrentPrice(null);
  };

  const getPreviewMessage = () => {
    const sym = symbol.toUpperCase() || 'SYMBOL';
    if (alertType === 'above' && targetPrice) {
      return `You'll be notified when ${sym} reaches $${targetPrice}`;
    } else if (alertType === 'below' && targetPrice) {
      return `You'll be notified when ${sym} drops to $${targetPrice}`;
    } else if (alertType === 'percent_change' && percentThreshold) {
      return `You'll be notified when ${sym} changes by ${percentThreshold}% from current price`;
    }
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Create Price Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
              className="bg-slate-800 border-slate-700"
              onBlur={(e) => {
                if (e.target.value && !currentPrice) {
                  fetchCurrentPrice(e.target.value);
                }
              }}
            />
          </div>

          <div>
            <Label htmlFor="assetName">Asset Name (optional)</Label>
            <Input
              id="assetName"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g., Apple Inc."
              className="bg-slate-800 border-slate-700"
            />
          </div>

          {currentPrice && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-400">
                Current Price: <span className="font-semibold">${currentPrice.toFixed(2)}</span>
              </p>
            </div>
          )}

          <div>
            <Label>Alert Type</Label>
            <RadioGroup value={alertType} onValueChange={(v) => setAlertType(v as any)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <RadioGroupItem value="above" id="above" />
                <Label htmlFor="above" className="flex items-center gap-2 cursor-pointer flex-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Price goes ABOVE</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <RadioGroupItem value="below" id="below" />
                <Label htmlFor="below" className="flex items-center gap-2 cursor-pointer flex-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>Price goes BELOW</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <RadioGroupItem value="percent_change" id="percent_change" />
                <Label htmlFor="percent_change" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Percent className="h-4 w-4 text-yellow-500" />
                  <span>Percent change</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {alertType !== 'percent_change' ? (
            <div>
              <Label htmlFor="targetPrice">Target Price ($)</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="bg-slate-800 border-slate-700"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="percentThreshold">Percent Threshold (%)</Label>
              <Input
                id="percentThreshold"
                type="number"
                step="0.1"
                value={percentThreshold}
                onChange={(e) => setPercentThreshold(e.target.value)}
                placeholder="5.0"
                className="bg-slate-800 border-slate-700"
              />
            </div>
          )}

          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note to remind yourself why you set this alert..."
              className="bg-slate-800 border-slate-700 min-h-[80px]"
            />
          </div>

          {getPreviewMessage() && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">{getPreviewMessage()}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
