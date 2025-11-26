import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { VoiceBriefingPlayer } from './VoiceBriefingPlayer';

interface SpeakableCardProps {
  children: ReactNode;
  text: string;
  voiceId?: string;
  className?: string;
}

export function SpeakableCard({ children, text, voiceId, className }: SpeakableCardProps) {
  return (
    <Card className={`relative ${className}`}>
      <div className="absolute top-4 right-4 z-10">
        <VoiceBriefingPlayer text={text} voiceId={voiceId} />
      </div>
      {children}
    </Card>
  );
}
