import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useElevenLabsVoice } from '@/hooks/useElevenLabsVoice';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface NarrativeOverlayProps {
  age: number;
  netWorth: number;
  lifeEvents: Array<{ year: number; label: string }>;
}

export function NarrativeOverlay({ age, netWorth, lifeEvents }: NarrativeOverlayProps) {
  const [narrative, setNarrative] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isSpeaking, isLoading: voiceLoading, speak, stop } = useElevenLabsVoice();

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(narrative, 'EXAVITQu4vr4xnSDxMaL'); // Sarah voice
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchNarrative() {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('digital-twin-narrative', {
          body: { age, netWorth, lifeEvents }
        });

        if (error) throw error;
        
        if (isMounted && data?.narrative) {
          setNarrative(data.narrative);
          setDisplayedText('');
        }
      } catch (error) {
        console.error('AI narrative error:', error);
        // Fallback to local generation
        const fallbackNarrative = generateNarrative(age, netWorth, lifeEvents);
        if (isMounted) {
          setNarrative(fallbackNarrative);
          setDisplayedText('');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchNarrative();

    return () => { isMounted = false; };
  }, [age, netWorth, lifeEvents]);

  // Typewriter effect
  useEffect(() => {
    if (!narrative) return;
    
    setDisplayedText('');
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < narrative.length) {
        setDisplayedText(narrative.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [narrative]);

  return (
    <AnimatePresence mode="wait">
      {displayedText && (
        <motion.div
          key={narrative}
          className="fixed bottom-40 left-1/2 -translate-x-1/2 max-w-2xl w-full px-8 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="backdrop-blur-xl bg-black/60 border border-cyan-500/30 rounded-lg p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            <div className="flex items-start gap-4">
              <motion.p
                className="flex-1 text-lg text-white font-light leading-relaxed"
                style={{
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                }}
              >
                {displayedText}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-5 bg-cyan-500 ml-1"
                />
              </motion.p>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                disabled={voiceLoading}
                className="shrink-0 hover:bg-cyan-500/10 hover:text-cyan-400"
              >
                {voiceLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSpeaking ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function generateNarrative(
  age: number,
  netWorth: number,
  lifeEvents: Array<{ year: number; label: string }>
): string {
  const recentEvent = lifeEvents.find(e => e.year === age);
  
  if (netWorth >= 1000000 && age >= 45) {
    return `At age ${age}, you achieve financial independence. Your passive income covers 100% of expenses. You are free to pursue your passions without financial constraints.`;
  }
  
  if (netWorth >= 1000000) {
    return `At age ${age}, you cross the million-dollar threshold. Your net worth stands at $${(netWorth / 1000000).toFixed(2)}M. Financial freedom is within reach.`;
  }
  
  if (recentEvent) {
    if (recentEvent.label.includes('House')) {
      return `At age ${age}, you purchase your first home. Your savings dip temporarily, but your net worth continues to grow through property appreciation.`;
    }
    if (recentEvent.label.includes('Job')) {
      return `At age ${age}, you land a significant career opportunity. Your increased income accelerates your path to financial security.`;
    }
    if (recentEvent.label.includes('Kids')) {
      return `At age ${age}, you welcome a child into your family. Your expenses increase, but careful planning keeps you on track toward your goals.`;
    }
  }
  
  if (netWorth >= 500000) {
    return `At age ${age}, you've built substantial wealth. With $${(netWorth / 1000).toFixed(0)}K saved, you're well-positioned for long-term financial security.`;
  }
  
  if (netWorth >= 100000) {
    return `At age ${age}, your disciplined saving habits are paying off. You've accumulated $${(netWorth / 1000).toFixed(0)}K and compound growth is accelerating.`;
  }
  
  if (netWorth < 0) {
    return `At age ${age}, you face financial challenges. Reducing expenses and increasing income are critical to returning to a positive trajectory.`;
  }
  
  return `At age ${age}, your net worth stands at $${(netWorth / 1000).toFixed(0)}K. Consistent saving and smart investing will compound into significant wealth over time.`;
}
