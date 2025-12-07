/**
 * @fileoverview Ambient AI Agent Component
 * Floating orb that delivers proactive financial insights
 * Respects user attention and persisted preferences
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAmbientAI, AmbientInsight } from '@/hooks/useAmbientAI';
import { useBrowserTTS } from '@/hooks/useBrowserTTS';
import { 
  Sparkles, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  PartyPopper,
  Moon,
  Clock,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AmbientAIAgentProps {
  className?: string;
}

const insightIcons: Record<AmbientInsight['type'], React.ElementType> = {
  tip: Lightbulb,
  alert: AlertTriangle,
  celebration: PartyPopper,
  nudge: TrendingUp
};

const insightColors: Record<AmbientInsight['type'], string> = {
  tip: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  alert: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  celebration: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  nudge: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
};

const orbGlowColors: Record<AmbientInsight['type'], string> = {
  tip: 'shadow-amber-500/50',
  alert: 'shadow-amber-500/50',
  celebration: 'shadow-yellow-500/50',
  nudge: 'shadow-emerald-500/50'
};

const frequencyLabels = {
  aggressive: 'Frequent',
  normal: 'Normal',
  minimal: 'Minimal',
  quiet: 'Quiet'
};

export function AmbientAIAgent({ className }: AmbientAIAgentProps) {
  const navigate = useNavigate();
  const { speak: speakTTS, stop: stopTTS, isSpeaking } = useBrowserTTS();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    state,
    currentInsight,
    queueLength,
    isConnected,
    isMuted,
    voiceEnabled,
    deliveryFrequency,
    isUserBusy,
    isInQuietHours,
    canDeliver,
    dismissInsight,
    toggleMute,
    toggleVoice,
    setDeliveryFrequency
  } = useAmbientAI({ enabled: true });

  const handleDismiss = (wasActedOn: boolean = false) => {
    stopTTS();
    dismissInsight(wasActedOn);
    setIsExpanded(false);
  };

  const handleAction = () => {
    if (currentInsight?.actionUrl) {
      navigate(currentInsight.actionUrl);
    }
    handleDismiss(true);
  };

  const handleVoiceToggle = () => {
    if (voiceEnabled && isSpeaking) {
      stopTTS();
    }
    toggleVoice();
  };

  // Speak insight when it appears
  const handleSpeak = () => {
    if (voiceEnabled && currentInsight && !isSpeaking) {
      speakTTS(currentInsight.message, { rate: 0.95 });
    }
  };

  const Icon = currentInsight ? insightIcons[currentInsight.type] : Sparkles;
  const colorClass = currentInsight ? insightColors[currentInsight.type] : '';
  const glowClass = currentInsight ? orbGlowColors[currentInsight.type] : 'shadow-primary/30';

  // Determine orb status color
  const getStatusColor = () => {
    if (!isConnected) return 'bg-muted';
    if (isInQuietHours) return 'bg-indigo-500';
    if (isUserBusy) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={cn("fixed bottom-24 right-6 z-50", className)}>
      <AnimatePresence mode="wait">
        {/* Expanded Speech Bubble */}
        {state === 'speaking' && currentInsight && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onAnimationComplete={handleSpeak}
            className={cn(
              "absolute bottom-16 right-0 w-80 p-4 rounded-2xl",
              "bg-gradient-to-br backdrop-blur-xl border",
              "bg-card/95",
              colorClass
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg bg-background/50",
                  currentInsight.type === 'alert' && "text-amber-500",
                  currentInsight.type === 'celebration' && "text-yellow-600",
                  currentInsight.type === 'tip' && "text-amber-500",
                  currentInsight.type === 'nudge' && "text-emerald-500"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {currentInsight.type}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-1 -mt-1"
                onClick={() => handleDismiss(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Message */}
            <p className="text-sm text-foreground leading-relaxed mb-4">
              {currentInsight.message}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleVoiceToggle}
              >
                {voiceEnabled ? (
                  <Volume2 className={cn("h-3.5 w-3.5 mr-1", isSpeaking && "text-primary animate-pulse")} />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                )}
                {voiceEnabled ? 'Voice On' : 'Voice Off'}
              </Button>

              {currentInsight.actionUrl && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleAction}
                >
                  {currentInsight.actionLabel || 'Take Action'}
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>

            {/* Queue indicator */}
            {queueLength > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 text-center">
                <span className="text-xs text-muted-foreground">
                  +{queueLength} more insight{queueLength > 1 ? 's' : ''} waiting
                </span>
              </div>
            )}

            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card/95 border-b border-r border-inherit rotate-45 transform" />
          </motion.div>
        )}

        {/* Floating Orb */}
        <motion.button
          key="orb"
          onClick={() => {
            if (state === 'speaking') {
              handleDismiss(false);
            } else {
              setIsExpanded(!isExpanded);
            }
          }}
          className={cn(
            "relative w-14 h-14 rounded-full",
            "bg-gradient-to-br from-primary/20 to-primary/5",
            "border border-primary/30",
            "flex items-center justify-center",
            "transition-all duration-300",
            "hover:scale-105",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
            state === 'speaking' && `shadow-lg ${glowClass}`,
            isMuted && "opacity-60"
          )}
          animate={{
            scale: state === 'idle' ? [1, 1.02, 1] : 1,
          }}
          transition={{
            scale: {
              duration: 3,
              repeat: state === 'idle' ? Infinity : 0,
              ease: 'easeInOut'
            }
          }}
        >
          {/* Breathing glow effect */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full bg-primary/10",
              state === 'speaking' && "bg-primary/20"
            )}
            animate={{
              scale: state === 'observing' || state === 'insight_ready' ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: state === 'observing' || state === 'insight_ready' ? [0.5, 0, 0.5] : [0.3, 0, 0.3]
            }}
            transition={{
              duration: state === 'insight_ready' ? 0.8 : 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Icon */}
          <motion.div
            animate={{
              rotate: state === 'observing' ? [0, 360] : 0
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: 'linear' }
            }}
          >
            <Sparkles className={cn(
              "h-6 w-6 text-primary",
              state === 'speaking' && "text-primary-foreground"
            )} />
          </motion.div>

          {/* Status indicator (connection + activity awareness) */}
          <motion.div
            className={cn(
              "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
              getStatusColor()
            )}
            animate={isConnected && !isUserBusy && !isInQuietHours ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            title={
              !isConnected ? 'Disconnected' :
              isInQuietHours ? 'Quiet Hours' :
              isUserBusy ? 'Waiting (you\'re busy)' :
              'Ready'
            }
          />

          {/* Queue badge */}
          {queueLength > 0 && state !== 'speaking' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
            >
              {queueLength}
            </motion.div>
          )}

          {/* Mute indicator */}
          {isMuted && (
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background">
              <VolumeX className="h-3 w-3 text-muted-foreground" />
            </div>
          )}

          {/* Quiet hours indicator */}
          {isInQuietHours && !isMuted && (
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background">
              <Moon className="h-3 w-3 text-indigo-400" />
            </div>
          )}
        </motion.button>

        {/* Mini menu when expanded (not speaking) */}
        {isExpanded && state !== 'speaking' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2"
          >
            {/* Status bar */}
            <div className="bg-background/90 backdrop-blur-xl rounded-lg px-3 py-2 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
              {!isConnected && "Disconnected"}
              {isConnected && isInQuietHours && "Quiet Hours Active"}
              {isConnected && !isInQuietHours && isUserBusy && "Waiting for you..."}
              {isConnected && !isInQuietHours && !isUserBusy && canDeliver && "Ready"}
            </div>

            {/* Mute button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs backdrop-blur-xl bg-background/80"
              onClick={toggleMute}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 mr-1.5" />
                  Unmute AI
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                  Mute AI
                </>
              )}
            </Button>

            {/* Frequency dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs backdrop-blur-xl bg-background/80"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {frequencyLabels[deliveryFrequency]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs">Insight Frequency</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeliveryFrequency('aggressive')}
                  className={cn(deliveryFrequency === 'aggressive' && "bg-accent")}
                >
                  Frequent (30s)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeliveryFrequency('normal')}
                  className={cn(deliveryFrequency === 'normal' && "bg-accent")}
                >
                  Normal (1m)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeliveryFrequency('minimal')}
                  className={cn(deliveryFrequency === 'minimal' && "bg-accent")}
                >
                  Minimal (3m)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeliveryFrequency('quiet')}
                  className={cn(deliveryFrequency === 'quiet' && "bg-accent")}
                >
                  Quiet (5m)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings link */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                navigate('/settings');
                setIsExpanded(false);
              }}
            >
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
