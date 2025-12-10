import { useState } from 'react';
import { SharedGoalsHero } from '@/components/goals-sharing/SharedGoalsHero';
import { ShareGoalModal } from '@/components/goals-sharing/ShareGoalModal';
import { SharedGoalCard } from '@/components/goals-sharing/SharedGoalCard';
import { CollaborativeProgress } from '@/components/goals-sharing/CollaborativeProgress';
import { GoalInvitations } from '@/components/goals-sharing/GoalInvitations';
import { SharedGoalActivity } from '@/components/goals-sharing/SharedGoalActivity';
import { useSharedGoals } from '@/hooks/useSharedGoals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancialGoalsSharing() {
  const [showShareModal, setShowShareModal] = useState(false);
  const { sharedWithMe, sharedByMe, isLoading } = useSharedGoals();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6" data-copilot-id="goals-sharing-page">
      <SharedGoalsHero onShareNew={() => setShowShareModal(true)} />

      <GoalInvitations />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="shared-with-me" className="space-y-6">
            <TabsList>
              <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
              <TabsTrigger value="shared-by-me">I've Shared</TabsTrigger>
            </TabsList>

            <TabsContent value="shared-with-me" className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : sharedWithMe.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No goals shared with you yet</p>
                  <p className="text-sm">When someone shares a goal, it will appear here</p>
                </div>
              ) : (
                sharedWithMe
                  .filter(s => s.status === 'accepted')
                  .map((share, index) => (
                    <SharedGoalCard
                      key={share.id}
                      share={share}
                      index={index}
                      type="shared-with-me"
                    />
                  ))
              )}
            </TabsContent>

            <TabsContent value="shared-by-me" className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : sharedByMe.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">You haven't shared any goals</p>
                  <p className="text-sm">Share goals with friends and family to track progress together</p>
                </div>
              ) : (
                sharedByMe.map((share, index) => (
                  <SharedGoalCard
                    key={share.id}
                    share={share}
                    index={index}
                    type="shared-by-me"
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <CollaborativeProgress />
          <SharedGoalActivity />
        </div>
      </div>

      <ShareGoalModal open={showShareModal} onOpenChange={setShowShareModal} />
    </div>
  );
}
