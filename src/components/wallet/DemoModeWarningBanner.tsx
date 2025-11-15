import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DemoModeWarningBanner() {
  return (
    <Alert variant="destructive" className="mb-6 border-2">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="font-bold">⚠️ DEMO MODE - Not Connected to Real Blockchain</AlertTitle>
      <AlertDescription className="text-sm">
        This wallet is for demonstration purposes only. No real blockchain transactions occur. 
        Funds shown are simulated and have no real value. Private keys are not secure.
      </AlertDescription>
    </Alert>
  );
}
