import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceModeButtonProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function VoiceModeButton({ isActive, onToggle, disabled }: VoiceModeButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={isActive ? "default" : "ghost"}
      onClick={onToggle}
      disabled={disabled}
      className="relative"
    >
      <motion.div
        animate={isActive ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {isActive ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </motion.div>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-md border-2 border-primary"
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </Button>
  );
}
