import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XCircle, Loader2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreditCoach } from '@/hooks/useCreditCoach';
import { toast } from 'sonner';

export function ClosureSimulatorCard() {
  const [cardAge, setCardAge] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [totalCreditLimit, setTotalCreditLimit] = useState('');
  const [avgAccountAge, setAvgAccountAge] = useState('');
  const [numAccounts, setNumAccounts] = useState('');
  const { mutate: analyzeImpact, data, isPending } = useCreditCoach();

  const handleAnalyze = () => {
    if (!cardAge || !cardLimit || !totalCreditLimit || !avgAccountAge || !numAccounts) {
      toast.error('Please fill in all fields');
      return;
    }

    analyzeImpact({
      mode: 'closure-simulator',
      data: { 
        cardAge: parseFloat(cardAge),
        cardLimit: parseFloat(cardLimit),
        totalCreditLimit: parseFloat(totalCreditLimit),
        avgAccountAge: parseFloat(avgAccountAge),
        numAccounts: parseInt(numAccounts)
      },
    }, {
      onSuccess: () => {
        toast.success('Analysis complete!');
      },
      onError: () => {
        toast.error('Analysis failed');
      },
    });
  };

  // Extract verdict from AI response
  const getVerdict = () => {
    if (!data?.result) return null;
    const result = data.result.toLowerCase();
    if (result.includes('safe to close')) return 'safe';
    if (result.includes('high risk')) return 'high';
    return 'moderate';
  };

  const verdict = getVerdict();

  return (
    <Card className="backdrop-blur-glass bg-glass border-glass-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <XCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <CardTitle>Closure Simulator</CardTitle>
            <CardDescription>Predict score impact before closing a card</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="card-age">Card Age (years)</Label>
            <Input
              id="card-age"
              type="number"
              placeholder="e.g., 5"
              value={cardAge}
              onChange={(e) => setCardAge(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-limit">Card Limit ($)</Label>
            <Input
              id="card-limit"
              type="number"
              placeholder="e.g., 5000"
              value={cardLimit}
              onChange={(e) => setCardLimit(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total-limit">Total Credit Limit ($)</Label>
          <Input
            id="total-limit"
            type="number"
            placeholder="Sum of all card limits"
            value={totalCreditLimit}
            onChange={(e) => setTotalCreditLimit(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="avg-age">Avg Account Age (years)</Label>
            <Input
              id="avg-age"
              type="number"
              placeholder="e.g., 3.5"
              value={avgAccountAge}
              onChange={(e) => setAvgAccountAge(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num-accounts">Number of Accounts</Label>
            <Input
              id="num-accounts"
              type="number"
              placeholder="e.g., 4"
              value={numAccounts}
              onChange={(e) => setNumAccounts(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isPending || !cardAge || !cardLimit || !totalCreditLimit || !avgAccountAge || !numAccounts}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Closure Impact'
          )}
        </Button>

        {data?.result && verdict && (
          <div className="space-y-4">
            {/* Verdict Badge */}
            <div className={`p-4 rounded-lg border-2 ${
              verdict === 'safe' ? 'bg-green-500/10 border-green-500/30' :
              verdict === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {verdict === 'safe' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : verdict === 'moderate' ? (
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {verdict === 'safe' ? 'Safe to Close' :
                     verdict === 'moderate' ? 'Moderate Risk' :
                     'High Risk'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {verdict === 'safe' ? 'Minimal impact expected' :
                     verdict === 'moderate' ? 'May drop 5-20 points' :
                     'Could drop 20+ points'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border">
              <p className="text-sm font-medium text-muted-foreground">Analysis:</p>
              <div className="text-sm whitespace-pre-wrap text-foreground/90">
                {data.result}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border">
                <p className="text-xs text-muted-foreground">Card Age</p>
                <p className="text-lg font-semibold">{cardAge} years</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border">
                <p className="text-xs text-muted-foreground">Credit Limit</p>
                <p className="text-lg font-semibold">${cardLimit}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
