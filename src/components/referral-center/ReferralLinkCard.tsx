import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralLinkCardProps {
  referralCode: string | null;
}

export function ReferralLinkCard({ referralCode }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode 
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : '';

  const copyToClipboard = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const share = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join $ave+',
          text: 'Save smarter with $ave+ - use my referral link to get started!',
          url: referralLink,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/20">
          <Gift className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Your Referral Link</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share this link with friends and earn rewards when they sign up
          </p>

          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
              placeholder="Loading..."
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              disabled={!referralCode}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={share}
              disabled={!referralCode}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {referralCode && (
            <p className="text-xs text-muted-foreground mt-2">
              Your code: <span className="font-mono font-medium">{referralCode}</span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}