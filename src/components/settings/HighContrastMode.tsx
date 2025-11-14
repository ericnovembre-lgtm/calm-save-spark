import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function HighContrastMode() {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('high-contrast-mode') === 'true';
  });

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      
      // Apply WCAG AAA compliant colors
      document.documentElement.style.setProperty('--foreground', '0 0% 0%'); // True black
      document.documentElement.style.setProperty('--background', '0 0% 100%'); // True white
      document.documentElement.style.setProperty('--primary', '220 100% 25%'); // Darker primary
      document.documentElement.style.setProperty('--muted-foreground', '0 0% 20%'); // Higher contrast
    } else {
      document.documentElement.classList.remove('high-contrast');
      
      // Reset to default theme colors
      document.documentElement.style.removeProperty('--foreground');
      document.documentElement.style.removeProperty('--background');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--muted-foreground');
    }

    localStorage.setItem('high-contrast-mode', String(highContrast));
  }, [highContrast]);

  const handleToggle = (checked: boolean) => {
    setHighContrast(checked);
    toast.success(checked ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <Label htmlFor="high-contrast" className="text-base font-semibold cursor-pointer">
              High Contrast Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Enhanced readability with WCAG AAA compliance
            </p>
          </div>
        </div>
        <Switch
          id="high-contrast"
          checked={highContrast}
          onCheckedChange={handleToggle}
        />
      </div>
    </Card>
  );
}
