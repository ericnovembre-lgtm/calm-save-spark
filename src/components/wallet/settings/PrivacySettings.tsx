import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, History } from "lucide-react";
import { useWalletSettings } from "@/hooks/useWalletSettings";

export function PrivacySettings() {
  const { settings, updateSettings, isUpdating } = useWalletSettings();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Privacy Controls</h3>
          <p className="text-sm text-muted-foreground">
            Control what information is visible in your wallet
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hide Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label htmlFor="hide-balance" className="text-base font-medium">
                Hide Balance
              </Label>
              <p className="text-sm text-muted-foreground">
                Show asterisks instead of actual balance amounts
              </p>
            </div>
          </div>
          <Switch
            id="hide-balance"
            checked={settings?.hide_balance || false}
            onCheckedChange={(checked) => updateSettings({ hide_balance: checked })}
            disabled={isUpdating}
          />
        </div>

        {/* Hide Transaction Amounts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EyeOff className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label htmlFor="hide-amounts" className="text-base font-medium">
                Hide Transaction Amounts
              </Label>
              <p className="text-sm text-muted-foreground">
                Mask amounts in transaction history
              </p>
            </div>
          </div>
          <Switch
            id="hide-amounts"
            checked={settings?.hide_transaction_amounts || false}
            onCheckedChange={(checked) => updateSettings({ hide_transaction_amounts: checked })}
            disabled={isUpdating}
          />
        </div>

        {/* Show Transaction History */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label htmlFor="show-history" className="text-base font-medium">
                Show Transaction History
              </Label>
              <p className="text-sm text-muted-foreground">
                Display recent transactions on main wallet page
              </p>
            </div>
          </div>
          <Switch
            id="show-history"
            checked={settings?.show_transaction_history !== false}
            onCheckedChange={(checked) => updateSettings({ show_transaction_history: checked })}
            disabled={isUpdating}
          />
        </div>
      </div>
    </div>
  );
}
