import { ReactNode } from 'react';
import { AuroraMeshBackground } from '@/components/dashboard/AuroraMeshBackground';
import { SkipLinks } from '@/components/accessibility/SkipLinks';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';

type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

interface DashboardShellProps {
  children: ReactNode;
  isGenerating: boolean;
  modelName?: string;
  syncStatus: SyncStatus;
  lastSynced?: Date;
  lastRefresh?: Date;
  netWorthChangePercent: number;
  userName?: string | null;
  generatedAt?: Date;
  processingTimeMs?: number;
  onRefresh: () => void;
  onForceRefresh: () => void;
}

export function DashboardShell({
  children,
  isGenerating,
  modelName,
  syncStatus,
  lastSynced,
  lastRefresh,
  netWorthChangePercent,
  userName,
  generatedAt,
  processingTimeMs,
  onRefresh,
  onForceRefresh,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen relative">
      {/* Aurora Background with net worth sentiment */}
      <AuroraMeshBackground netWorthChangePercent={netWorthChangePercent} />
      
      {/* Skip Links for Accessibility */}
      <SkipLinks />

      {/* Header */}
      <DashboardHeader
        isGenerating={isGenerating}
        modelName={modelName}
        syncStatus={syncStatus}
        lastSynced={lastSynced}
        lastRefresh={lastRefresh}
        userName={userName}
        onRefresh={onRefresh}
        onForceRefresh={onForceRefresh}
      />

      {/* Main Content */}
      {children}

      {/* Footer */}
      <DashboardFooter 
        generatedAt={generatedAt}
        processingTimeMs={processingTimeMs}
      />
    </div>
  );
}
