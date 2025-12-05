import { UnifiedFAB } from '@/components/dashboard/UnifiedFAB';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { ChatSidebar } from '@/components/dashboard/ChatSidebar';
import { AnomalyAlertCenter } from '@/components/ai/AnomalyAlertCenter';
import { AmbientAIAgent } from '@/components/dashboard/ambient/AmbientAIAgent';
import { LiveTransactionPanel } from './LiveTransactionPanel';

interface FloatingControlsProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
}

export function FloatingControls({ isChatOpen, onToggleChat }: FloatingControlsProps) {
  return (
    <>
      <UnifiedFAB />
      <CommandPalette />
      <ChatSidebar isOpen={isChatOpen} onToggle={onToggleChat} />
      <AnomalyAlertCenter />
      <AmbientAIAgent />
      <LiveTransactionPanel />
    </>
  );
}
