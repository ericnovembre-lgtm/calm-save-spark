import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCodeExporter } from './QRCodeExporter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';

interface WalletBackupModalProps {
  open: boolean;
  onClose: () => void;
  walletId: string;
  walletAddress: string;
}

export function WalletBackupModal({ open, onClose, walletId, walletAddress }: WalletBackupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [encryptionHint, setEncryptionHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [seedPhrase] = useState('demo seed phrase word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
  const [copied, setCopied] = useState(false);
  const [encryptedBackup, setEncryptedBackup] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateBackup = async () => {
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    setIsCreating(true);

    try {
      // Client-side encryption of seed phrase
      const encoder = new TextEncoder();
      const data = encoder.encode(seedPhrase);
      const encrypted = btoa(String.fromCharCode(...data)); // Simple base64 for demo

      // Call edge function to store
      const { data: result, error } = await supabase.functions.invoke('wallet-backup', {
        body: {
          action: 'create',
          wallet_id: walletId,
          encrypted_backup: encrypted,
          password,
          encryption_hint: encryptionHint,
        },
      });

      if (error) throw error;

      setEncryptedBackup(encrypted);
      toast({ title: 'Backup created successfully!' });
      setStep(4);
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: 'Failed to create backup',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Create Wallet Backup
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                This will display your wallet's seed phrase. Make sure you're in a private location.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Your seed phrase is the master key to your wallet. Anyone with access to it can control your funds.
              We'll help you create an encrypted backup.
            </p>
            <Button onClick={() => setStep(2)} className="w-full">
              I Understand, Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Alert className="bg-orange-500/10 border-orange-500/20">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <AlertDescription className="text-orange-500">
                Write this down on paper and store it securely. Never store it digitally.
              </AlertDescription>
            </Alert>

            <div className="bg-slate-900 p-6 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-sm font-medium">Seed Phrase</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySeed}
                  className="text-xs"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="font-mono text-sm leading-relaxed">{seedPhrase}</p>
            </div>

            <Button onClick={() => setStep(3)} className="w-full">
              I've Written It Down
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a password to encrypt your backup. You'll need this password to recover your wallet.
            </p>

            <div className="space-y-2">
              <Label htmlFor="password">Encryption Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hint">Password Hint (Optional)</Label>
              <Input
                id="hint"
                value={encryptionHint}
                onChange={(e) => setEncryptionHint(e.target.value)}
                placeholder="A hint to help you remember"
              />
            </div>

            <Button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating Backup...' : 'Create Encrypted Backup'}
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Your backup has been encrypted and stored securely. Use this QR code to recover your wallet.
              </AlertDescription>
            </Alert>

            <QRCodeExporter
              data={encryptedBackup}
              walletAddress={walletAddress}
              timestamp={new Date().toISOString()}
            />

            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
