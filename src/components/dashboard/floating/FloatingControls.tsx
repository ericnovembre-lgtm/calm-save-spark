import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { AnomalyAlertCenter } from '@/components/ai/AnomalyAlertCenter';
import { AmbientAIAgent } from '@/components/dashboard/ambient/AmbientAIAgent';
import { LiveTransactionPanel } from './LiveTransactionPanel';

export function FloatingControls() {
  return (
    <>
      <CommandPalette />
      <AnomalyAlertCenter />
      <AmbientAIAgent />
      <LiveTransactionPanel />
    </>
  );
}
