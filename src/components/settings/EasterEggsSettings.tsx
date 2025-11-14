import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export function EasterEggsSettings() {
  const [enabled, setEnabled] = useState(() => 
    localStorage.getItem('easter-eggs-enabled') !== 'false'
  );

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    localStorage.setItem('easter-eggs-enabled', String(checked));
    window.location.reload(); // Reload to apply changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="easter-eggs">Enable Easter Eggs & Delight</Label>
          <p className="text-sm text-muted-foreground">
            Hidden interactions, holiday effects, and milestone celebrations
          </p>
        </div>
        <Switch
          id="easter-eggs"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>
    </div>
  );
}
