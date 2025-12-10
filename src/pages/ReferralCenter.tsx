import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ReferralLinkCard } from '@/components/referral-center/ReferralLinkCard';
import { ReferralStats } from '@/components/referral-center/ReferralStats';
import { ReferralHistoryList } from '@/components/referral-center/ReferralHistoryList';
import { PendingRewardsCard } from '@/components/referral-center/PendingRewardsCard';
import { ShareReferralModal } from '@/components/referral-center/ShareReferralModal';
import { useReferrals } from '@/hooks/useReferrals';
import { Gift, Share2 } from 'lucide-react';

export default function ReferralCenter() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { referrals, referralCode, isLoading, createReferral } = useReferrals();

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : '';

  return (
    <AppLayout>
      <div 
        className="container max-w-6xl mx-auto px-4 py-8 space-y-6"
        data-copilot-id="referral-center-page"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Referral Center
            </h1>
            <p className="text-muted-foreground">
              Invite friends and earn rewards together
            </p>
          </div>
          <Button onClick={() => setIsShareOpen(true)} disabled={!referralCode}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        <ReferralLinkCard referralCode={referralCode} />

        <PendingRewardsCard />

        <ReferralStats />

        <div>
          <h2 className="text-lg font-semibold mb-4">Referral History</h2>
          <ReferralHistoryList referrals={referrals} />
        </div>

        {/* How it works section */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="font-medium mb-1">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Send your unique referral link to friends and family
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="font-medium mb-1">They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                Your friend creates an account using your link
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="font-medium mb-1">You Both Earn</h3>
              <p className="text-sm text-muted-foreground">
                Get rewards when they complete their first goal
              </p>
            </div>
          </div>
        </div>

        <ShareReferralModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          referralLink={referralLink}
          onSendEmail={email => createReferral.mutate(email)}
        />
      </div>
    </AppLayout>
  );
}