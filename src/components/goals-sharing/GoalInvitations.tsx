import { motion } from 'framer-motion';
import { UserPlus, Check, X, Target } from 'lucide-react';
import { useSharedGoals } from '@/hooks/useSharedGoals';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function GoalInvitations() {
  const { pendingInvitations, respondToShare, isLoading } = useSharedGoals();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">Pending Invitations</h3>
        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500">
          {pendingInvitations.length}
        </span>
      </div>

      <div className="space-y-3">
        {pendingInvitations.map((invitation, index) => (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                  {invitation.goal?.icon || '🎯'}
                </div>
                <div>
                  <h4 className="font-medium">{invitation.goal?.name || 'Shared Goal'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {invitation.permission_level === 'view' 
                      ? 'View only' 
                      : invitation.permission_level === 'contribute'
                      ? 'Can contribute'
                      : 'Full access'
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respondToShare.mutate({ shareId: invitation.id, accept: false })}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => respondToShare.mutate({ shareId: invitation.id, accept: true })}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
