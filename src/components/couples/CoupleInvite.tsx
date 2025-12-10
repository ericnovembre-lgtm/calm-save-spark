import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Copy, Mail, Link2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface CoupleInviteProps {
  inviteCode?: string;
  isPending: boolean;
  onCreateInvite: (email?: string) => void;
  onJoinCouple: (code: string) => void;
  isCreating: boolean;
  isJoining: boolean;
}

export function CoupleInvite({ 
  inviteCode, 
  isPending, 
  onCreateInvite, 
  onJoinCouple,
  isCreating,
  isJoining
}: CoupleInviteProps) {
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('create');

  const handleCopyCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinCouple(joinCode.trim());
    }
  };

  // Already has pending invite
  if (isPending && inviteCode) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Waiting for Partner</CardTitle>
          <CardDescription>Share this code with your partner to connect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Invite Code</p>
            <p className="text-3xl font-mono font-bold tracking-wider text-foreground">
              {inviteCode}
            </p>
          </div>
          
          <Button 
            onClick={handleCopyCode} 
            variant="outline" 
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Code
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Your partner can enter this code to link your accounts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-center">
        <motion.div 
          className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Heart className="w-8 h-8 text-primary" />
        </motion.div>
        <CardTitle>Connect with Partner</CardTitle>
        <CardDescription>
          Link your accounts to track shared finances together
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'create' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('create')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Invite Partner
          </Button>
          <Button
            variant={mode === 'join' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setMode('join')}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Join Partner
          </Button>
        </div>
        
        {mode === 'create' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Partner's Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="partner@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We'll send them an email with the invite code
              </p>
            </div>
            
            <Button 
              onClick={() => onCreateInvite(inviteEmail || undefined)}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Invite'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Enter Invite Code</Label>
              <Input
                id="code"
                placeholder="Enter 12-character code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="text-center font-mono tracking-wider"
              />
            </div>
            
            <Button 
              onClick={handleJoin}
              disabled={isJoining || !joinCode.trim()}
              className="w-full"
            >
              {isJoining ? 'Joining...' : 'Join Partner'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
