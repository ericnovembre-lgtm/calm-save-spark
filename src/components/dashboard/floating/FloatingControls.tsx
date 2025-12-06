import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { AnomalyAlertCenter } from '@/components/ai/AnomalyAlertCenter';
import { LiveTransactionPanel } from './LiveTransactionPanel';

export function FloatingControls() {
  return (
    <>
      <CommandPalette />
      <AnomalyAlertCenter />
      <LiveTransactionPanel />
    </>
  );
}
