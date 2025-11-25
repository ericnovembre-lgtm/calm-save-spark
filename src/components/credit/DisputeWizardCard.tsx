import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Loader2, Copy, CheckCircle } from 'lucide-react';
import { useCreditCoach } from '@/hooks/useCreditCoach';
import { toast } from 'sonner';

const DISPUTE_TYPES = [
  { value: 'not-my-account', label: 'Not my account (Identity theft)' },
  { value: 'incorrect-balance', label: 'Incorrect balance' },
  { value: 'paid-showing-open', label: 'Account paid but showing open' },
  { value: 'late-payment-error', label: 'Late payment reported incorrectly' },
  { value: 'belongs-to-other', label: 'Account belongs to someone else' },
  { value: 'duplicate-account', label: 'Duplicate account' },
];

export function DisputeWizardCard() {
  const [disputeType, setDisputeType] = useState('');
  const [accountName, setAccountName] = useState('');
  const [copied, setCopied] = useState(false);
  const { mutate: generateLetter, data, isPending } = useCreditCoach();

  const handleGenerate = () => {
    if (!disputeType) {
      toast.error('Please select an error type');
      return;
    }

    generateLetter({
      mode: 'dispute-wizard',
      data: { disputeType, accountName },
    }, {
      onSuccess: () => {
        toast.success('Dispute letter generated!');
      },
      onError: () => {
        toast.error('Failed to generate letter');
      },
    });
  };

  const handleCopy = () => {
    if (data?.result) {
      navigator.clipboard.writeText(data.result);
      setCopied(true);
      toast.success('Letter copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="backdrop-blur-glass bg-glass border-glass-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Dispute Wizard</CardTitle>
            <CardDescription>Generate FCRA-cited dispute letters</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dispute-type">Error Type</Label>
          <Select value={disputeType} onValueChange={setDisputeType}>
            <SelectTrigger id="dispute-type">
              <SelectValue placeholder="Select error type" />
            </SelectTrigger>
            <SelectContent>
              {DISPUTE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-name">Account Name (Optional)</Label>
          <Input
            id="account-name"
            placeholder="e.g., Chase Freedom"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isPending || !disputeType}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Dispute Letter'
          )}
        </Button>

        {data?.result && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Your Dispute Letter:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="text-sm whitespace-pre-wrap font-mono text-foreground/90 max-h-96 overflow-y-auto">
              {data.result}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
