import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReceiveModal({ open, onClose }: ReceiveModalProps) {
  const { data: wallet } = useQuery({
    queryKey: ['user-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('chain', 'ethereum')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success('Address copied to clipboard');
    }
  };

  // Generate QR code URL (using a free QR code API)
  const qrCodeUrl = wallet?.address 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${wallet.address}`
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive Crypto</DialogTitle>
        </DialogHeader>

        {wallet ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan QR code or copy address below
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                {qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="Wallet QR Code" 
                    className="w-64 h-64"
                  />
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Your Wallet Address</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted p-3 rounded text-sm break-all">
                  {wallet.address}
                </code>
                <Button variant="outline" size="icon" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Only send Ethereum (ETH) and ERC-20 tokens to this address.
                Sending other assets may result in permanent loss.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Create a wallet first to receive crypto
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
