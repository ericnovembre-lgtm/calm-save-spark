import { MilestoneCelebration } from '@/components/effects/MilestoneCelebration';
import { LottieCelebrations } from '@/components/effects/LottieCelebrations';
import { Milestone } from '@/hooks/useMilestoneDetector';

type CelebrationType = 'success' | 'achievement' | 'goal' | 'milestone';

interface DashboardCelebrationsProps {
  milestone?: Milestone | null;
  onDismissMilestone: () => void;
  celebrationType: CelebrationType;
  showCelebration: boolean;
  onCelebrationComplete: () => void;
}

export function DashboardCelebrations({
  milestone,
  onDismissMilestone,
  celebrationType,
  showCelebration,
  onCelebrationComplete,
}: DashboardCelebrationsProps) {
  return (
    <>
      {milestone && (
        <MilestoneCelebration
          milestone={milestone}
          onDismiss={onDismissMilestone}
        />
      )}
      <LottieCelebrations
        type={celebrationType}
        isVisible={showCelebration}
        onComplete={onCelebrationComplete}
      />
    </>
  );
}
