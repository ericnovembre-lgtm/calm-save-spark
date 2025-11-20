import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaveformVisualizer } from './WaveformVisualizer';
import { fadeInScale } from '@/lib/motion-variants';

interface VoiceModeInterfaceProps {
  isActive: boolean;
  state: 'idle' | 'listening' | 'processing' | 'speaking';
  transcript: string;
  audioData?: Uint8Array;
  onStop: () => void;
  onSubmit?: () => void;
}

export function VoiceModeInterface({
  isActive,
  state,
  transcript,
  audioData,
  onStop,
  onSubmit
}: VoiceModeInterfaceProps) {
  const getStateLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening... Speak now';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'AI is responding...';
      default:
        return '';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className="h-8 w-8 text-primary" />;
      case 'processing':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          />
        );
      case 'speaking':
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              🔊
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="absolute bottom-full left-0 right-0 mb-2 p-6 bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg"
        >
          <div className="flex flex-col items-center gap-4">
            {/* State Icon */}
            <motion.div
              animate={state === 'listening' ? {
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 2,
                repeat: state === 'listening' ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {getStateIcon()}
            </motion.div>

            {/* Waveform Visualizer */}
            <WaveformVisualizer
              audioData={audioData}
              isActive={state === 'listening' || state === 'speaking'}
              state={state === 'speaking' ? 'speaking' : 'listening'}
            />

            {/* State Label */}
            <motion.p
              className="text-sm text-muted-foreground font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {getStateLabel()}
            </motion.p>

            {/* Real-time Transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 bg-muted/50 rounded-lg"
              >
                <p className="text-sm text-foreground text-center">
                  "{transcript}"
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {transcript && state === 'listening' && onSubmit && (
                <Button
                  size="sm"
                  onClick={onSubmit}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Now
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={onStop}
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
