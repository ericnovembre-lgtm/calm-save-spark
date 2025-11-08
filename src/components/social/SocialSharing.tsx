import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Link2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function SocialSharing() {
  const shareAchievement = async (platform: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('social_shares').insert({
        user_id: user.id,
        share_type: 'achievement',
        platform
      } as any);

      const message = "I just reached a new savings milestone on $ave+! 🎉";
      const url = "https://saveplus.app";

      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${url}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
          break;
        case 'copy_link':
          navigator.clipboard.writeText(`${message} ${url}`);
          toast.success("Link copied to clipboard!");
          return;
      }

      toast.success("Opening share dialog...");
    } catch (error: any) {
      toast.error(`Failed to share: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Share Your Success</h3>
              <p className="text-sm text-muted-foreground">
                Inspire others and earn bonus points
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => shareAchievement('twitter')} variant="outline" className="h-auto flex-col gap-2 py-4">
              <Twitter className="w-6 h-6 text-blue-400" />
              <span>Twitter</span>
            </Button>

            <Button onClick={() => shareAchievement('facebook')} variant="outline" className="h-auto flex-col gap-2 py-4">
              <Facebook className="w-6 h-6 text-blue-600" />
              <span>Facebook</span>
            </Button>

            <Button onClick={() => shareAchievement('linkedin')} variant="outline" className="h-auto flex-col gap-2 py-4">
              <Linkedin className="w-6 h-6 text-blue-700" />
              <span>LinkedIn</span>
            </Button>

            <Button onClick={() => shareAchievement('copy_link')} variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link2 className="w-6 h-6" />
              <span>Copy Link</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5">
        <div className="text-center space-y-2">
          <h4 className="font-semibold">Earn 50 Points Per Share!</h4>
          <p className="text-sm text-muted-foreground">
            Share your achievements and milestones to inspire others and earn bonus rewards
          </p>
        </div>
      </Card>
    </div>
  );
}