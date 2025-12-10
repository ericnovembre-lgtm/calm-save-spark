import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Facebook, Link, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserMilestone } from '@/hooks/useUserMilestones';

interface MilestoneShareCardProps {
  milestone: UserMilestone;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MilestoneShareCard({ milestone, open, onOpenChange }: MilestoneShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 I just achieved "${milestone.milestone_name}" on $ave+! #FinancialMilestone #SavingsGoals`;
  const shareUrl = window.location.origin;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20 border border-amber-500/30"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-lg font-bold">{milestone.milestone_name}</h3>
              {milestone.milestone_description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {milestone.milestone_description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Achieved on {new Date(milestone.achieved_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShareTwitter}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShareFacebook}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Link className="w-4 h-4 mr-2" />
              )}
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
