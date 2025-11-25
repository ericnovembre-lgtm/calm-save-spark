import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletBackupModal } from '../WalletBackupModal';
import { WalletRecoveryModal } from '../WalletRecoveryModal';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface WalletBackupSettingsProps {
  walletId: string;
  walletAddress: string;
}

export function WalletBackupSettings({ walletId, walletAddress }: WalletBackupSettingsProps) {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Check if wallet has backup
  const { data: backup, refetch } = useQuery({
    queryKey: ['wallet-backup', walletId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('wallet_backups')
        .select('*')
        .eq('wallet_id', walletId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const hasBackup = !!backup;

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Wallet Backup</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create an encrypted backup of your wallet seed phrase
            </p>
          </div>
          
          {hasBackup ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          )}
        </div>

        {hasBackup ? (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-500 font-medium">Backed Up</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{format(new Date(backup.created_at), 'MMM d, yyyy')}</span>
              </div>
              {backup.last_accessed_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Accessed:</span>
                  <span>{format(new Date(backup.last_accessed_at), 'MMM d, yyyy')}</span>
                </div>
              )}
              {backup.encryption_hint && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password Hint:</span>
                  <span className="italic">{backup.encryption_hint}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBackupModal(true)}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Update Backup
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRecoveryModal(true)}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Recovery
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-sm text-orange-500">
                ⚠️ No backup found. Create one to protect your wallet.
              </p>
            </div>

            <Button
              onClick={() => setShowBackupModal(true)}
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Create Backup Now
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• Your backup is encrypted with your password</p>
          <p>• Store the QR code in a secure, offline location</p>
          <p>• Never share your backup with anyone</p>
        </div>
      </Card>

      <WalletBackupModal
        open={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        walletId={walletId}
        walletAddress={walletAddress}
      />

      <WalletRecoveryModal
        open={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        onSuccess={() => refetch()}
      />
    </>
  );
}
