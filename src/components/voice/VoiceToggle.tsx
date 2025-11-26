import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

export function VoiceToggle() {
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage('voice-enabled', false);

  const handleToggle = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    toast.success(newValue ? 'Voice enabled' : 'Voice disabled');
  };

  return (
    <Button
      onClick={handleToggle}
      variant="ghost"
      size="sm"
      className="gap-2"
    >
      {voiceEnabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          <span>Voice On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span>Voice Off</span>
        </>
      )}
    </Button>
  );
}
