import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Upload, Key } from 'lucide-react';

interface WalletRecoveryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WalletRecoveryModal({ open, onClose, onSuccess }: WalletRecoveryModalProps) {
  const [method, setMethod] = useState<'qr' | 'paste'>('paste');
  const [encryptedBackup, setEncryptedBackup] = useState('');
  const [password, setPassword] = useState('');
  const [walletId, setWalletId] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();

  const handleRecover = async () => {
    if (!encryptedBackup || !password || !walletId) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setIsRecovering(true);

    try {
      const { data, error } = await supabase.functions.invoke('wallet-backup', {
        body: {
          action: 'recover',
          wallet_id: walletId,
          password,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: 'Wallet recovered successfully!' });
        onSuccess();
        onClose();
      } else {
        throw new Error('Recovery failed');
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast({
        title: 'Failed to recover wallet',
        description: error instanceof Error ? error.message : 'Incorrect password or invalid backup',
        variant: 'destructive',
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Recover Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              Enter your wallet ID, encrypted backup, and password to recover your wallet.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant={method === 'paste' ? 'default' : 'outline'}
              onClick={() => setMethod('paste')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Paste Backup
            </Button>
            <Button
              variant={method === 'qr' ? 'default' : 'outline'}
              onClick={() => setMethod('qr')}
              className="flex-1"
              disabled
            >
              Scan QR Code
            </Button>
          </div>

          {method === 'paste' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="wallet-id">Wallet ID</Label>
                <Input
                  id="wallet-id"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  placeholder="Enter your wallet ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup">Encrypted Backup</Label>
                <Textarea
                  id="backup"
                  value={encryptedBackup}
                  onChange={(e) => setEncryptedBackup(e.target.value)}
                  placeholder="Paste your encrypted backup data here"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery-password">Decryption Password</Label>
                <Input
                  id="recovery-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your encryption password"
                />
              </div>

              <Button
                onClick={handleRecover}
                disabled={isRecovering}
                className="w-full"
              >
                {isRecovering ? 'Recovering...' : 'Recover Wallet'}
              </Button>
            </>
          )}

          {method === 'qr' && (
            <div className="text-center py-8 text-muted-foreground">
              QR code scanning will be available soon
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
