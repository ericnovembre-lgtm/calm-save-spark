import { OfflineBanner } from '@/components/dashboard/OfflineBanner';
import { EmailVerificationBanner } from '@/components/dashboard/EmailVerificationBanner';
import { SmartBanner } from '@/components/dashboard/SmartBanner';
import { ProactiveNudgesBanner } from '@/components/dashboard/ProactiveNudgesBanner';
import { TransactionAlertBanner } from '@/components/alerts/TransactionAlertToast';
import { TransactionAlert } from '@/hooks/useTransactionAlerts';

interface DashboardBannersProps {
  isOffline: boolean;
  isSyncing: boolean;
  isStale: boolean;
  lastCachedAt?: Date;
  transactionAlerts: TransactionAlert[];
  onRefresh: () => void;
  onNavigateTransactions: () => void;
  onDismissAlerts: () => void;
}

export function DashboardBanners({
  isOffline,
  isSyncing,
  isStale,
  lastCachedAt,
  transactionAlerts,
  onRefresh,
  onNavigateTransactions,
  onDismissAlerts,
}: DashboardBannersProps) {
  return (
    <>
      <OfflineBanner
        isOffline={isOffline}
        isSyncing={isSyncing}
        isStale={isStale}
        lastCachedAt={lastCachedAt}
        onRefresh={onRefresh}
      />
      <EmailVerificationBanner />
      <SmartBanner />
      <ProactiveNudgesBanner />
      {transactionAlerts.length > 0 && (
        <TransactionAlertBanner 
          alerts={transactionAlerts}
          onViewAll={onNavigateTransactions}
          onDismissAll={onDismissAlerts}
        />
      )}
    </>
  );
}
