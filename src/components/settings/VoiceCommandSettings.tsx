import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, FileText, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useMobilePreferences } from '@/hooks/useMobilePreferences';
import { haptics } from '@/lib/haptics';
import { useToast } from '@/hooks/use-toast';

// Check browser support for Speech Recognition
const isSpeechSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export function VoiceCommandSettings() {
  const { preferences, isLoading, updatePreferences } = useMobilePreferences();
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  // Local state for immediate UI feedback
  const [localDelay, setLocalDelay] = useState(preferences?.voice_auto_submit_delay ?? 1500);

  useEffect(() => {
    if (preferences?.voice_auto_submit_delay) {
      setLocalDelay(preferences.voice_auto_submit_delay);
    }
  }, [preferences?.voice_auto_submit_delay]);

  const handleVoiceToggle = async (enabled: boolean) => {
    haptics.buttonPress();
    await updatePreferences({ voice_enabled: enabled });
  };

  const handleDelayChange = (value: number[]) => {
    setLocalDelay(value[0]);
  };

  const handleDelayCommit = async (value: number[]) => {
    haptics.select();
    await updatePreferences({ voice_auto_submit_delay: value[0] });
  };

  const handleFeedbackSoundToggle = async (enabled: boolean) => {
    haptics.buttonPress();
    await updatePreferences({ voice_feedback_sound: enabled });
  };

  const handleShowTranscriptToggle = async (enabled: boolean) => {
    haptics.buttonPress();
    await updatePreferences({ voice_show_transcript: enabled });
  };

  const testVoiceInput = async () => {
    if (!isSpeechSupported) {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResult('idle');
    haptics.select();

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = () => {
        setTestResult('success');
        setIsTesting(false);
        haptics.buttonPress();
        toast({
          title: 'Voice Input Working',
          description: 'Your microphone is set up correctly.',
        });
      };

      recognition.onerror = () => {
        setTestResult('error');
        setIsTesting(false);
        haptics.validationError();
        toast({
          title: 'Test Failed',
          description: 'Could not detect voice input. Check your microphone.',
          variant: 'destructive',
        });
      };

      recognition.onend = () => {
        if (testResult === 'idle') {
          setIsTesting(false);
        }
      };

      recognition.start();
      
      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (isTesting) {
          recognition.stop();
          setIsTesting(false);
          setTestResult('success');
          haptics.buttonPress();
          toast({
            title: 'Microphone Connected',
            description: 'Your microphone is accessible.',
          });
        }
      }, 3000);
    } catch {
      setTestResult('error');
      setIsTesting(false);
      haptics.validationError();
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access in your browser settings.',
        variant: 'destructive',
      });
    }
  };

  // Format delay for display
  const formatDelay = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getDelayLabel = (ms: number) => {
    if (ms <= 800) return 'Faster';
    if (ms <= 1500) return 'Balanced';
    return 'Careful';
  };

  if (isLoading) {
    return (
      <Card className="glass-widget">
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
      </Card>
    );
  }

  const voiceEnabled = preferences?.voice_enabled ?? true;
  const feedbackSound = preferences?.voice_feedback_sound ?? true;
  const showTranscript = preferences?.voice_show_transcript ?? true;

  return (
    <Card className="glass-widget">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Voice Commands</CardTitle>
              <CardDescription>Hands-free financial queries</CardDescription>
            </div>
          </div>
          <Switch
            checked={voiceEnabled}
            onCheckedChange={handleVoiceToggle}
            aria-label="Enable voice commands"
          />
        </div>
      </CardHeader>

      {voiceEnabled && (
        <CardContent className="space-y-6">
          {/* Auto-Submit Delay */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-submit-delay" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                Auto-Submit Delay
              </Label>
              <span className="text-sm font-mono text-muted-foreground">
                {formatDelay(localDelay)}
              </span>
            </div>
            <Slider
              id="auto-submit-delay"
              min={500}
              max={3000}
              step={100}
              value={[localDelay]}
              onValueChange={handleDelayChange}
              onValueCommit={handleDelayCommit}
              aria-label="Auto-submit delay in milliseconds"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Faster</span>
              <span className="font-medium text-foreground">
                {getDelayLabel(localDelay)}
              </span>
              <span>Careful</span>
            </div>
          </div>

          {/* Feedback Sound */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="feedback-sound" className="flex items-center gap-2 cursor-pointer">
              {feedbackSound ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <span>Feedback Sound</span>
                <p className="text-xs text-muted-foreground font-normal">
                  Audio cue when listening starts/stops
                </p>
              </div>
            </Label>
            <Switch
              id="feedback-sound"
              checked={feedbackSound}
              onCheckedChange={handleFeedbackSoundToggle}
              aria-label="Enable feedback sound"
            />
          </div>

          {/* Show Transcript */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="show-transcript" className="flex items-center gap-2 cursor-pointer">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <span>Show Transcript</span>
                <p className="text-xs text-muted-foreground font-normal">
                  Display live speech-to-text
                </p>
              </div>
            </Label>
            <Switch
              id="show-transcript"
              checked={showTranscript}
              onCheckedChange={handleShowTranscriptToggle}
              aria-label="Show live transcript"
            />
          </div>

          {/* Test Voice Button */}
          <div className="pt-2 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={testVoiceInput}
              disabled={isTesting || !isSpeechSupported}
            >
              {isTesting ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <Mic className="h-4 w-4 text-primary" />
                  </motion.div>
                  <span>Listening...</span>
                </motion.div>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Test Voice Input
                </>
              )}
            </Button>

            {/* Browser Support Indicator */}
            <div className="flex items-center gap-2 text-xs">
              {isSpeechSupported ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-muted-foreground">
                    Voice input supported in this browser
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-muted-foreground">
                    Voice input not supported in this browser
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
