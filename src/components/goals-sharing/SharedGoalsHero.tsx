import { motion } from 'framer-motion';
import { Users, Target, Share2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSharedGoals } from '@/hooks/useSharedGoals';

interface SharedGoalsHeroProps {
  onShareNew: () => void;
}

export function SharedGoalsHero({ onShareNew }: SharedGoalsHeroProps) {
  const { sharedWithMe, sharedByMe, pendingInvitations } = useSharedGoals();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 p-6 border border-green-500/20"
      data-copilot-id="goals-sharing-hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-400/10 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Goal Sharing</h1>
              <p className="text-muted-foreground">Achieve more together</p>
            </div>
          </div>

          <Button onClick={onShareNew}>
            <Share2 className="w-4 h-4 mr-2" />
            Share a Goal
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Shared With Me</span>
            </div>
            <p className="text-2xl font-bold">{sharedWithMe.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">I've Shared</span>
            </div>
            <p className="text-2xl font-bold">{sharedByMe.length}</p>
          </div>

          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold">{pendingInvitations.length}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
