import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MessageCircle, Twitter, Linkedin, Send } from 'lucide-react';

interface ShareReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralLink: string;
  onSendEmail: (email: string) => void;
}

export function ShareReferralModal({ 
  isOpen, 
  onClose, 
  referralLink,
  onSendEmail 
}: ShareReferralModalProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const shareText = encodeURIComponent('Save smarter with $ave+ - use my referral link to get started!');
  const shareUrl = encodeURIComponent(referralLink);

  const socialLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      color: 'hover:bg-sky-100 hover:text-sky-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: 'hover:bg-blue-100 hover:text-blue-600',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      color: 'hover:bg-green-100 hover:text-green-600',
    },
  ];

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    try {
      await onSendEmail(email);
      setEmail('');
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Referral</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email invite */}
          <form onSubmit={handleSendEmail} className="space-y-3">
            <Label>Invite by Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="friend@example.com"
                required
              />
              <Button type="submit" disabled={sending}>
                {sending ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or share via
              </span>
            </div>
          </div>

          {/* Social share buttons */}
          <div className="flex justify-center gap-4">
            {socialLinks.map(social => (
              <Button
                key={social.name}
                variant="outline"
                size="lg"
                className={`flex-col gap-1 h-auto py-3 ${social.color}`}
                onClick={() => window.open(social.url, '_blank')}
              >
                <social.icon className="w-5 h-5" />
                <span className="text-xs">{social.name}</span>
              </Button>
            ))}
            <Button
              variant="outline"
              size="lg"
              className="flex-col gap-1 h-auto py-3 hover:bg-purple-100 hover:text-purple-600"
              onClick={() => {
                window.location.href = `mailto:?subject=Join $ave+&body=${decodeURIComponent(shareText)} ${referralLink}`;
              }}
            >
              <Mail className="w-5 h-5" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}