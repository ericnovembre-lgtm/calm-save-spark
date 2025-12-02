import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Mail, Share2, Download, Loader2, Twitter, Linkedin, Facebook, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

interface ShareScenarioModalProps {
  open: boolean;
  onClose: () => void;
  scenarioData: {
    name: string;
    currentAge: number;
    retirementAge: number;
    initialNetWorth: number;
    events: any[];
    timeline: { year: number; netWorth: number; }[];
    monteCarloData: any[];
  };
}

export function ShareScenarioModal({ open, onClose, scenarioData }: ShareScenarioModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>("never");
  const [showQR, setShowQR] = useState(false);

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique share token
      const shareToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate final net worth and success probability
      const finalNetWorth = scenarioData.timeline[scenarioData.timeline.length - 1]?.netWorth || 0;
      const successProbability = scenarioData.monteCarloData.length > 0 
        ? Math.round((scenarioData.monteCarloData.filter(d => d.p50 >= 1000000).length / scenarioData.monteCarloData.length) * 100)
        : 75;

      // Calculate expiration
      let expiresAt: string | null = null;
      if (expiresIn === "1week") {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (expiresIn === "1month") {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Generate preview image
      const { data: previewData, error: previewError } = await supabase.functions.invoke('generate-scenario-preview', {
        body: {
          scenarioName: scenarioData.name,
          finalNetWorth,
          events: scenarioData.events,
          successProbability
        }
      });

      if (previewError) {
        console.error('Preview generation error:', previewError);
        toast.error('Failed to generate preview image');
      }

      const imageUrl = previewData?.imageUrl || null;
      setPreviewImageUrl(imageUrl);

      // Save to database
      const { error: dbError } = await supabase
        .from('shared_scenario_links')
        .insert({
          user_id: user.id,
          share_token: shareToken,
          scenario_name: scenarioData.name,
          scenario_data: scenarioData,
          preview_image_url: imageUrl,
          expires_at: expiresAt
        });

      if (dbError) throw dbError;

      const url = `${window.location.origin}/shared/${shareToken}`;
      setShareLink(url);
      toast.success('Share link generated!');

    } catch (error: any) {
      console.error('Error generating share link:', error);
      toast.error(error.message || 'Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const sendEmail = async () => {
    if (!recipientEmail || !shareLink) return;

    setIsSendingEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.functions.invoke('share-scenario-email', {
        body: {
          recipientEmail,
          recipientName,
          shareUrl: shareLink,
          scenarioName: scenarioData.name,
          previewImageUrl,
          senderName: profile?.full_name || 'A $ave+ user'
        }
      });

      if (error) throw error;

      toast.success(`Email sent to ${recipientEmail}!`);
      setRecipientEmail("");
      setRecipientName("");

    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const shareToSocial = (platform: string) => {
    if (!shareLink) return;

    const text = `Check out my financial scenario: ${scenarioData.name}`;
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border-cyan-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono text-cyan-500">
            ◢◤ Share Scenario ◥◣
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Generate a shareable link and preview image for "{scenarioData.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview Image */}
          <AnimatePresence>
            {previewImageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-lg overflow-hidden border border-cyan-500/20"
              >
                <img src={previewImageUrl} alt="Scenario preview" className="w-full" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expiration Selector */}
          {!shareLink && (
            <div>
              <Label className="text-white/80">Link Expiration</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={expiresIn === "1week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiresIn("1week")}
                  className="flex-1"
                >
                  1 Week
                </Button>
                <Button
                  variant={expiresIn === "1month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiresIn("1month")}
                  className="flex-1"
                >
                  1 Month
                </Button>
                <Button
                  variant={expiresIn === "never" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiresIn("never")}
                  className="flex-1"
                >
                  Never
                </Button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!shareLink && (
            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Share Link
                </>
              )}
            </Button>
          )}

          {/* Share Link Display */}
          <AnimatePresence>
            {shareLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Link Display */}
                <div>
                  <Label className="text-white/80">Share Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="font-mono text-sm bg-black/40 border-cyan-500/30"
                    />
                    <Button onClick={copyToClipboard} variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Social Sharing */}
                <div>
                  <Label className="text-white/80">Share on Social Media</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => shareToSocial('twitter')}
                      className="flex-1"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => shareToSocial('linkedin')}
                      className="flex-1"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => shareToSocial('facebook')}
                      className="flex-1"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                  </div>
                </div>

                {/* Email Sharing */}
                <div>
                  <Label className="text-white/80">Share via Email</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Recipient name (optional)"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="flex-1 bg-black/40 border-cyan-500/30"
                    />
                    <Input
                      type="email"
                      placeholder="Recipient email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="flex-1 bg-black/40 border-cyan-500/30"
                    />
                    <Button
                      onClick={sendEmail}
                      disabled={!recipientEmail || isSendingEmail}
                      variant="outline"
                    >
                      {isSendingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowQR(!showQR)}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {showQR ? 'Hide' : 'Show'} QR Code
                  </Button>
                  <AnimatePresence>
                    {showQR && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-center mt-4 p-4 bg-white rounded-lg"
                      >
                        <QRCodeSVG value={shareLink} size={200} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}