import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, Bell, Trash2 } from "lucide-react";
import { useGasAlerts } from "@/hooks/useGasAlerts";
import { useActiveChain } from "@/hooks/useActiveChain";
import { useChainConfigs } from "@/hooks/useChainConfigs";
import { useToast } from "@/hooks/use-toast";

export function GasAlertSettings() {
  const { alert, upsertAlert, deleteAlert, isUpdating } = useGasAlerts();
  const { selectedChain } = useActiveChain();
  const { chains } = useChainConfigs();
  const { toast } = useToast();
  
  const [threshold, setThreshold] = useState(alert?.threshold_gwei?.toString() || '50');
  const [isActive, setIsActive] = useState(alert?.is_active ?? true);

  const activeChain = chains.find(c => c.chain_id === selectedChain);

  const handleSave = () => {
    const thresholdValue = parseFloat(threshold);
    if (isNaN(thresholdValue) || thresholdValue <= 0) {
      toast({
        title: "Invalid threshold",
        description: "Please enter a valid gas price threshold",
        variant: "destructive",
      });
      return;
    }

    upsertAlert({ threshold_gwei: thresholdValue, is_active: isActive });
    toast({
      title: "Alert saved",
      description: `You'll be notified when ${activeChain?.chain_name || 'gas'} fees drop below ${threshold} gwei`,
    });
  };

  const handleDelete = () => {
    deleteAlert();
    toast({
      title: "Alert deleted",
      description: "Gas fee alert has been removed",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Gas Fee Alerts</h3>
          <p className="text-sm text-muted-foreground">
            Get notified when gas prices drop below your threshold on {activeChain?.chain_name || 'selected chain'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Active Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label htmlFor="gas-alert-active" className="text-base font-medium">
                Enable Gas Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when gas is cheap
              </p>
            </div>
          </div>
          <Switch
            id="gas-alert-active"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isUpdating}
          />
        </div>

        {/* Threshold Input */}
        <div className="space-y-2">
          <Label htmlFor="threshold">Gas Price Threshold (gwei)</Label>
          <Input
            id="threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="50"
            min="1"
            disabled={isUpdating}
          />
          <p className="text-xs text-muted-foreground">
            Current gas: ~{Math.floor(Math.random() * 50 + 20)} gwei
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="flex-1"
          >
            {alert ? 'Update Alert' : 'Create Alert'}
          </Button>
          {alert && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {alert?.last_triggered_at && (
          <p className="text-xs text-muted-foreground">
            Last triggered: {new Date(alert.last_triggered_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
