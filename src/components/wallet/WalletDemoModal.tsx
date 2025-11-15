import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Shield, Zap, Lock } from "lucide-react";

const DEMO_MODAL_STORAGE_KEY = "wallet_demo_modal_shown";

export function WalletDemoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem(DEMO_MODAL_STORAGE_KEY);
    if (!hasSeenModal) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(DEMO_MODAL_STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl">
              ⚠️ Wallet Demo Mode
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 text-base">
            <p className="font-semibold text-foreground">
              This wallet is for demonstration purposes only and has important limitations:
            </p>
            
            <div className="space-y-3 text-muted-foreground">
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">No Real Blockchain Transactions:</strong> All transactions are simulated. No actual crypto is sent or received.
                </div>
              </div>
              
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Funds Are Not Real:</strong> All balances and tokens shown are simulated and have zero monetary value.
                </div>
              </div>
              
              <div className="flex gap-3">
                <Lock className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Keys Are Not Secure:</strong> Private keys are stored in demo mode and should never be used for real assets.
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-2">
                🚀 Want to use a real wallet?
              </p>
              <p className="text-sm text-muted-foreground">
                Contact support to upgrade to production mode with real Web3 wallet integration, secure key management, and actual blockchain transactions.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose} className="w-full sm:w-auto">
            I Understand - Continue to Demo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
