import { DashboardTour } from '@/components/dashboard/DashboardTour';
import { WhatsNewModal } from '@/components/dashboard/WhatsNewModal';
import { FeatureSpotlight } from '@/components/dashboard/FeatureSpotlight';
import { NewUserSpotlight } from '@/components/onboarding/NewUserSpotlight';

interface DashboardOnboardingProps {
  showTutorial?: boolean;
}

export function DashboardOnboarding({ showTutorial = false }: DashboardOnboardingProps) {
  return (
    <>
      {showTutorial && <DashboardTour />}
      <WhatsNewModal />
      <FeatureSpotlight />
      <NewUserSpotlight />
    </>
  );
}
