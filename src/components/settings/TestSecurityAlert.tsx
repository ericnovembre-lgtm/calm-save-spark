import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logSecurityEvent } from '@/lib/security-logger';
import { toast } from 'sonner';
import { Mail, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export function TestSecurityAlert() {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const handleSendTestAlert = async () => {
    setIsSending(true);
    try {
      await logSecurityEvent({
        event_type: 'suspicious_activity',
        event_message: 'Test security alert - This is a test notification to verify your email alerts are working correctly.',
        severity: 'warning',
        metadata: {
          test: true,
          triggered_at: new Date().toISOString(),
          source: 'security_settings_test',
        },
      });
      
      setLastSent(new Date());
      toast.success('Test alert sent!', {
        description: 'Check your email for the security notification.',
      });
    } catch (error) {
      toast.error('Failed to send test alert', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Test Email Notifications
        </CardTitle>
        <CardDescription>
          Send a test security alert to verify your email notifications are working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            This will send a real email to your registered email address. 
            Make sure your security notification preferences are enabled.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {lastSent && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Last sent: {lastSent.toLocaleTimeString()}
              </div>
            )}
          </div>
          <Button
            onClick={handleSendTestAlert}
            disabled={isSending}
            variant="outline"
            className="gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Test Alert
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
