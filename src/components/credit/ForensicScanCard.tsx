import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useCreditCoach } from '@/hooks/useCreditCoach';

interface ForensicScanCardProps {
  currentScore: number;
}

export const ForensicScanCard = ({ currentScore }: ForensicScanCardProps) => {
  const { mutate, isPending, data } = useCreditCoach();

  const handleScan = () => {
    mutate({
      mode: 'forensic-scan',
      data: {
        score: currentScore,
        utilization: 45, // Example data - would come from actual report
        accountAge: 7,
      },
    });
  };

  return (
    <Card className="p-6 backdrop-blur-glass bg-glass border-glass-border">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold text-foreground">Deep Report Scanner</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Get a plain-English analysis of what's really affecting your credit score.
      </p>

      <Button
        onClick={handleScan}
        disabled={isPending}
        className="w-full"
        variant="outline"
      >
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Run Forensic Scan
      </Button>

      {data && (
        <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-2">Analysis:</h4>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {data.result}
          </div>
        </div>
      )}
    </Card>
  );
};
