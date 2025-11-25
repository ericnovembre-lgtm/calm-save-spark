import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Copy } from 'lucide-react';
import { useCreditCoach } from '@/hooks/useCreditCoach';
import { toast } from 'sonner';

export const LimitLiftScriptCard = () => {
  const { mutate, isPending, data } = useCreditCoach();

  const handleGenerate = () => {
    mutate({
      mode: 'limit-lift',
      data: {
        currentLimit: 5000,
        paymentHistory: 'excellent',
      },
    });
  };

  const handleCopy = () => {
    if (data?.result) {
      navigator.clipboard.writeText(data.result);
      toast.success('Script copied to clipboard');
    }
  };

  return (
    <Card className="p-6 backdrop-blur-glass bg-glass border-glass-border">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold text-foreground">Limit Lift Coach</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Get a word-for-word script to request a credit limit increase from your bank.
      </p>

      <Button
        onClick={handleGenerate}
        disabled={isPending}
        className="w-full"
        variant="outline"
      >
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Generate Script
      </Button>

      {data && (
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-lg bg-muted/20 border border-border">
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {data.result}
            </div>
          </div>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Script
          </Button>
        </div>
      )}
    </Card>
  );
};
