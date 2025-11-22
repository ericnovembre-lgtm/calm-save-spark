import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Subscription } from '@/hooks/useSubscriptions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Copy, Mail, Loader2, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface NegotiationScriptModalProps {
  subscription: Subscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NegotiationScriptModal({ subscription, open, onOpenChange }: NegotiationScriptModalProps) {
  const [script, setScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-negotiation-script', {
        body: {
          merchant: subscription.merchant,
          amount: subscription.amount,
          category: subscription.category || 'subscription',
          frequency: subscription.frequency,
        }
      });

      if (error) throw error;
      setScript(data.script);
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error('Failed to generate negotiation script');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    toast.success('Script copied to clipboard');
  };

  const sendToEmail = () => {
    const subject = `Negotiation Script for ${subscription.merchant}`;
    const body = encodeURIComponent(script);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Negotiation Help for {subscription.merchant}
          </DialogTitle>
          <DialogDescription>
            AI-generated negotiation script to help you reduce your bill. Personalized based on your payment history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!script ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Generate a personalized negotiation script with AI
              </p>
              <Button
                onClick={generateScript}
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Your negotiation script will appear here..."
              />

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Success Rate:</span> ~73% of users save money
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={sendToEmail}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button onClick={generateScript} disabled={isGenerating}>
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
