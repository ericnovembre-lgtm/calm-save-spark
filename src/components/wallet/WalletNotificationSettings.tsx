import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { useWalletPushNotifications } from "@/hooks/useWalletPushNotifications";

export function WalletNotificationSettings() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = useWalletPushNotifications();

  if (!isSupported) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bell className="w-4 h-4" />
          <p className="text-sm">Push notifications not supported on this device</p>
        </div>
      </div>
    );
  }

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <div>
            <Label htmlFor="push-notifications" className="text-base font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get alerts for transactions and important updates
            </p>
          </div>
        </div>
        <Switch
          id="push-notifications"
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
