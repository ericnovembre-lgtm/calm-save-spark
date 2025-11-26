import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoice } from '@/contexts/VoiceContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

export function VoiceToggle() {
  const { isVoiceEnabled, toggleVoice } = useVoice();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoice}
          aria-label={isVoiceEnabled ? 'Disable voice features' : 'Enable voice features'}
          className="relative"
        >
          <motion.div
            initial={false}
            animate={{ scale: isVoiceEnabled ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {isVoiceEnabled ? (
              <Mic className="h-5 w-5 text-primary" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </motion.div>
          {isVoiceEnabled && (
            <motion.span
              className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isVoiceEnabled ? 'Voice features enabled' : 'Voice features disabled'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
