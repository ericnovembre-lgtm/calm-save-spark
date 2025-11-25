import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSearch, Loader2 } from 'lucide-react';
import { useCreditCoach } from '@/hooks/useCreditCoach';

export const InquiryDetectiveCard = () => {
  const [inquiryCode, setInquiryCode] = useState('');
  const { mutate, isPending, data } = useCreditCoach();

  const handleDecode = () => {
    if (!inquiryCode.trim()) return;
    mutate({
      mode: 'inquiry-detective',
      data: { inquiryCode },
    });
  };

  return (
    <Card className="p-6 backdrop-blur-glass bg-glass border-glass-border">
      <div className="flex items-center gap-2 mb-4">
        <FileSearch className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold text-foreground">Inquiry Detective</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Decode cryptic inquiry codes into human-readable merchant names.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inquiry">Inquiry Code</Label>
          <Input
            id="inquiry"
            placeholder="e.g., CBNA/HD"
            value={inquiryCode}
            onChange={(e) => setInquiryCode(e.target.value)}
            className="font-mono"
          />
        </div>

        <Button
          onClick={handleDecode}
          disabled={!inquiryCode.trim() || isPending}
          className="w-full"
          variant="outline"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Decode Inquiry
        </Button>

        {data && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <h4 className="text-sm font-semibold text-foreground mb-2">Decoded:</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.result}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
