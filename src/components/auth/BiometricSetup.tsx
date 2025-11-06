import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  getRegisteredDevices,
  removeBiometric,
} from '@/lib/webauthn';
import { announce } from '@/components/layout/LiveRegion';
import { trackEvent } from '@/lib/analytics';
import { formatDistanceToNow } from 'date-fns';

export function BiometricSetup() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAvailability = async () => {
      const supported = isWebAuthnSupported();
      const available = await isPlatformAuthenticatorAvailable();
      setIsAvailable(supported && available);
      
      if (supported && available) {
        await loadDevices();
      }
    };
    checkAvailability();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await getRegisteredDevices();
      setDevices(data || []);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      trackEvent('biometric_setup_started', {});

      const deviceName = `${navigator.userAgent.includes('Mac') ? 'Mac' : navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Device'} - ${new Date().toLocaleDateString()}`;
      
      await registerBiometric(deviceName);
      
      trackEvent('biometric_setup_success', {});
      announce('Biometric authentication enabled successfully', 'polite');
      
      toast({
        title: 'Success!',
        description: 'Biometric authentication has been enabled',
      });

      await loadDevices();
    } catch (error: any) {
      console.error('Biometric setup error:', error);
      trackEvent('biometric_setup_failed', { error: error.message });
      
      let message = 'Failed to enable biometric authentication';
      
      if (error.message?.includes('cancelled')) {
        message = 'Setup was cancelled';
      } else if (error.message?.includes('NotAllowedError')) {
        message = 'Permission denied. Please allow biometric access in your browser settings.';
      }

      toast({
        title: 'Setup failed',
        description: message,
        variant: 'destructive',
      });
      announce(`Setup failed: ${message}`, 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await removeBiometric(deleteId);
      
      toast({
        title: 'Removed',
        description: 'Biometric credential has been removed',
      });

      await loadDevices();
      setDeleteId(null);
    } catch (error) {
      console.error('Error removing credential:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove biometric credential',
        variant: 'destructive',
      });
    }
  };

  if (!isAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Face ID and Touch ID are not available on this device or browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Sign in quickly and securely using Face ID or Touch ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                No biometric credentials registered yet
              </p>
              <Button
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Enable Biometric Sign-In
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{device.device_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {device.last_used_at
                            ? `Last used ${formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true })}`
                            : `Added ${formatDistanceToNow(new Date(device.created_at), { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(device.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Remove credential</span>
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Add Another Device
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove biometric credential?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer be able to sign in using this biometric credential.
              You can always add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}