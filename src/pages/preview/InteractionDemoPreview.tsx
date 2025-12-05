/**
 * InteractionDemoPreview - Preview version of Interaction Playground
 * Bypasses authentication for visual testing
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hand, 
  MousePointerClick, 
  Vibrate, 
  Volume2, 
  VolumeX, 
  Bell, 
  Zap,
  Wallet,
  Music,
  ListChecks,
  Smartphone,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLongPress } from '@/hooks/useLongPress';
import { useDoubleTap } from '@/hooks/useDoubleTap';
import { useInteractionFeedback } from '@/hooks/useInteractionFeedback';
import { useTransactionFeedback } from '@/hooks/useTransactionFeedback';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { notificationSounds } from '@/lib/notification-sounds';
import { SwipeableWidget } from '@/components/dashboard/gestures/SwipeableWidget';
import { AmbientSoundscape } from '@/components/audio/AmbientSoundscape';
import { PreviewWrapper } from '@/components/debug/PreviewWrapper';

type LogEntry = {
  id: number;
  timestamp: Date;
  type: 'gesture' | 'haptic' | 'sound' | 'combined';
  action: string;
};

export default function InteractionDemoPreview() {
  const prefersReducedMotion = useReducedMotion();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState([30]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logIdCounter, setLogIdCounter] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gestures: true,
    haptics: true,
    sounds: true,
    notifications: true,
    combined: true,
    transactions: true,
    ambient: true
  });

  const [longPressStatus, setLongPressStatus] = useState<'idle' | 'pressing' | 'triggered'>('idle');
  const [doubleTapCount, setDoubleTapCount] = useState(0);
  const [swipeMessage, setSwipeMessage] = useState('');

  const feedback = useInteractionFeedback();
  const transactionFeedback = useTransactionFeedback();

  const addLog = useCallback((type: LogEntry['type'], action: string) => {
    setLogIdCounter(prev => prev + 1);
    setLogs(prev => [{
      id: logIdCounter + 1,
      timestamp: new Date(),
      type,
      action
    }, ...prev].slice(0, 50));
  }, [logIdCounter]);

  const longPressHandlers = useLongPress(
    () => {
      setLongPressStatus('triggered');
      addLog('gesture', 'Long press triggered (500ms)');
      setTimeout(() => setLongPressStatus('idle'), 1500);
    },
    {
      onStart: () => setLongPressStatus('pressing'),
      onCancel: () => setLongPressStatus('idle'),
      duration: 500
    }
  );

  const doubleTapHandlers = useDoubleTap(() => {
    setDoubleTapCount(prev => prev + 1);
    addLog('gesture', 'Double tap detected');
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const HapticButton = ({ onClick, children, variant = 'outline' }: { onClick: () => void; children: React.ReactNode; variant?: 'outline' | 'default' | 'secondary'; }) => (
    <Button variant={variant} size="sm" onClick={() => { if (hapticEnabled) onClick(); }} className="text-xs">
      {children}
    </Button>
  );

  const SoundButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode; }) => (
    <Button variant="outline" size="sm" onClick={() => { if (soundEnabled) onClick(); }} className="text-xs">
      {children}
    </Button>
  );

  return (
    <PreviewWrapper pageName="Interaction Playground">
      <div className="min-h-screen bg-background p-4 md:p-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Interaction Playground</h1>
            <p className="text-muted-foreground text-sm">Test Phase 7 gestures, haptics, and sounds</p>
            
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-muted-foreground" />
                <Switch checked={hapticEnabled} onCheckedChange={setHapticEnabled} aria-label="Toggle haptics" />
                <span className="text-xs text-muted-foreground">Haptics</span>
              </div>
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-muted-foreground" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} aria-label="Toggle sounds" />
                <span className="text-xs text-muted-foreground">Sounds</span>
              </div>
              {prefersReducedMotion && (
                <Badge variant="secondary" className="text-xs">
                  <Info className="w-3 h-3 mr-1" />Reduced Motion
                </Badge>
              )}
            </div>
          </div>

          {/* Device Info */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                <span>Vibration API: {navigator.vibrate ? '✓ Supported' : '✗ Not supported'}</span>
                <span className="mx-2">|</span>
                <span>Audio API: {typeof AudioContext !== 'undefined' ? '✓ Supported' : '✗ Not supported'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Gestures Section */}
          <Collapsible open={expandedSections.gestures} onOpenChange={() => toggleSection('gestures')}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hand className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Gesture Demos</CardTitle>
                    </div>
                    {expandedSections.gestures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div {...longPressHandlers} className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[120px] ${longPressStatus === 'idle' ? 'border-border bg-muted/30' : ''} ${longPressStatus === 'pressing' ? 'border-amber-500 bg-amber-500/10 scale-95' : ''} ${longPressStatus === 'triggered' ? 'border-green-500 bg-green-500/10' : ''}`}>
                      <Hand className="w-8 h-8 text-muted-foreground" />
                      <span className="font-medium">Long Press Demo</span>
                      <span className="text-xs text-muted-foreground">Hold for 500ms</span>
                      <Badge variant={longPressStatus === 'triggered' ? 'default' : 'secondary'}>
                        {longPressStatus === 'idle' && 'Ready'}
                        {longPressStatus === 'pressing' && 'Pressing...'}
                        {longPressStatus === 'triggered' && '✓ Triggered!'}
                      </Badge>
                    </div>

                    <div {...doubleTapHandlers} className="p-6 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer hover:border-primary/50 transition-colors">
                      <MousePointerClick className="w-8 h-8 text-muted-foreground" />
                      <span className="font-medium">Double Tap Demo</span>
                      <span className="text-xs text-muted-foreground">Tap twice quickly</span>
                      <Badge variant="default">Count: {doubleTapCount}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Swipeable Widget</span>
                    <SwipeableWidget
                      onSwipeLeft={() => { setSwipeMessage('Swiped Left! (Archive)'); addLog('gesture', 'Swipe left detected'); setTimeout(() => setSwipeMessage(''), 2000); }}
                      onSwipeRight={() => { setSwipeMessage('Swiped Right! (Quick Action)'); addLog('gesture', 'Swipe right detected'); setTimeout(() => setSwipeMessage(''), 2000); }}
                      leftLabel="Archive"
                      rightLabel="Action"
                    >
                      <div className="p-4 bg-card border border-border rounded-lg flex items-center justify-between">
                        <span>← Swipe me →</span>
                        <AnimatePresence>
                          {swipeMessage && (
                            <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm text-primary font-medium">
                              {swipeMessage}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </SwipeableWidget>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Haptics Section */}
          <Collapsible open={expandedSections.haptics} onOpenChange={() => toggleSection('haptics')}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Vibrate className="w-5 h-5 text-violet-500" />
                      <CardTitle className="text-lg">Haptic Patterns</CardTitle>
                    </div>
                    {expandedSections.haptics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Intensities</span>
                    <div className="flex flex-wrap gap-2">
                      <HapticButton onClick={() => { haptics.vibrate('light'); addLog('haptic', 'Light vibration'); }}>Light</HapticButton>
                      <HapticButton onClick={() => { haptics.vibrate('medium'); addLog('haptic', 'Medium vibration'); }}>Medium</HapticButton>
                      <HapticButton onClick={() => { haptics.vibrate('heavy'); addLog('haptic', 'Heavy vibration'); }}>Heavy</HapticButton>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Patterns</span>
                    <div className="flex flex-wrap gap-2">
                      <HapticButton onClick={() => { haptics.pattern('tap'); addLog('haptic', 'Tap pattern'); }}>Tap</HapticButton>
                      <HapticButton onClick={() => { haptics.pattern('success'); addLog('haptic', 'Success pattern'); }}>Success</HapticButton>
                      <HapticButton onClick={() => { haptics.pattern('error'); addLog('haptic', 'Error pattern'); }}>Error</HapticButton>
                      <HapticButton onClick={() => { haptics.pattern('warning'); addLog('haptic', 'Warning pattern'); }}>Warning</HapticButton>
                      <HapticButton onClick={() => { haptics.pattern('achievement'); addLog('haptic', 'Achievement pattern'); }}>Achievement</HapticButton>
                      <HapticButton onClick={() => { haptics.pattern('notification'); addLog('haptic', 'Notification pattern'); }}>Notification</HapticButton>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Convenience Methods</span>
                    <div className="flex flex-wrap gap-2">
                      <HapticButton onClick={() => { haptics.buttonPress(); addLog('haptic', 'Button press'); }}>Button Press</HapticButton>
                      <HapticButton onClick={() => { haptics.toggle(true); addLog('haptic', 'Toggle'); }}>Toggle</HapticButton>
                      <HapticButton onClick={() => { haptics.swipe(); addLog('haptic', 'Swipe'); }}>Swipe</HapticButton>
                      <HapticButton onClick={() => { haptics.longPress(); addLog('haptic', 'Long press'); }}>Long Press</HapticButton>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Sounds Section */}
          <Collapsible open={expandedSections.sounds} onOpenChange={() => toggleSection('sounds')}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-cyan-500" />
                      <CardTitle className="text-lg">Sound Effects</CardTitle>
                    </div>
                    {expandedSections.sounds ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">UI Sounds</span>
                    <div className="flex flex-wrap gap-2">
                      <SoundButton onClick={() => { soundEffects.click(); addLog('sound', 'Click sound'); }}>Click</SoundButton>
                      <SoundButton onClick={() => { soundEffects.hover(); addLog('sound', 'Hover sound'); }}>Hover</SoundButton>
                      <SoundButton onClick={() => { soundEffects.success(); addLog('sound', 'Success sound'); }}>Success</SoundButton>
                      <SoundButton onClick={() => { soundEffects.error(); addLog('sound', 'Error sound'); }}>Error</SoundButton>
                      <SoundButton onClick={() => { soundEffects.warning(); addLog('sound', 'Warning sound'); }}>Warning</SoundButton>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Financial Sounds</span>
                    <div className="flex flex-wrap gap-2">
                      <SoundButton onClick={() => { soundEffects.coinDrop(); addLog('sound', 'Coin drop'); }}>Coin Drop</SoundButton>
                      <SoundButton onClick={() => { soundEffects.milestone(); addLog('sound', 'Milestone'); }}>Milestone</SoundButton>
                      <SoundButton onClick={() => { soundEffects.progressTick(); addLog('sound', 'Progress tick'); }}>Progress Tick</SoundButton>
                      <SoundButton onClick={() => { soundEffects.swipe(); addLog('sound', 'Swipe sound'); }}>Swipe</SoundButton>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Notifications Section */}
          <Collapsible open={expandedSections.notifications} onOpenChange={() => toggleSection('notifications')}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      <CardTitle className="text-lg">Notification Sounds</CardTitle>
                    </div>
                    {expandedSections.notifications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <SoundButton onClick={() => { notificationSounds.alert(); addLog('sound', 'Alert notification'); }}>Alert</SoundButton>
                    <SoundButton onClick={() => { notificationSounds.insight(); addLog('sound', 'Insight notification'); }}>Insight</SoundButton>
                    <SoundButton onClick={() => { notificationSounds.message(); addLog('sound', 'Message notification'); }}>Message</SoundButton>
                    <SoundButton onClick={() => { notificationSounds.reminder(); addLog('sound', 'Reminder notification'); }}>Reminder</SoundButton>
                    <SoundButton onClick={() => { notificationSounds.achievement(); addLog('sound', 'Achievement notification'); }}>Achievement</SoundButton>
                    <SoundButton onClick={() => { notificationSounds.transaction(); addLog('sound', 'Transaction notification'); }}>Transaction</SoundButton>
                    <SoundButton onClick={() => { notificationSounds.urgent(); addLog('sound', 'Urgent notification'); }}>Urgent</SoundButton>
                    <SoundButton onClick={() => { notificationSounds.celebrate(); addLog('sound', 'Celebrate notification'); }}>Celebrate</SoundButton>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Combined Feedback Section */}
          <Collapsible open={expandedSections.combined} onOpenChange={() => toggleSection('combined')}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-500" />
                      <CardTitle className="text-lg">Combined Feedback (Haptic + Sound)</CardTitle>
                    </div>
                    {expandedSections.combined ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">These trigger both haptic and sound feedback together</p>
                  <div className="flex flex-wrap gap-2">
                    <HapticButton onClick={() => { feedback.onSuccess(); addLog('combined', 'Success feedback'); }}>Success</HapticButton>
                    <HapticButton onClick={() => { feedback.onError(); addLog('combined', 'Error feedback'); }}>Error</HapticButton>
                    <HapticButton onClick={() => { feedback.onWarning(); addLog('combined', 'Warning feedback'); }}>Warning</HapticButton>
                    <HapticButton onClick={() => { feedback.onAchievement(); addLog('combined', 'Achievement feedback'); }}>Achievement</HapticButton>
                    <HapticButton onClick={() => { feedback.onNotification(); addLog('combined', 'Notification feedback'); }}>Notification</HapticButton>
                    <HapticButton onClick={() => { feedback.onTap(); addLog('combined', 'Tap feedback'); }}>Tap</HapticButton>
                    <HapticButton onClick={() => { feedback.onInsight(); addLog('combined', 'Insight feedback'); }}>Insight</HapticButton>
                    <HapticButton onClick={() => { feedback.onSwipe(); addLog('combined', 'Swipe feedback'); }}>Swipe</HapticButton>
                    <HapticButton onClick={() => { feedback.onGoalProgress(); addLog('combined', 'Goal progress'); }}>Goal Progress</HapticButton>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Transaction Feedback Section */}
          <Collapsible open={expandedSections.transactions} onOpenChange={() => toggleSection('transactions')}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg">Transaction Feedback</CardTitle>
                    </div>
                    {expandedSections.transactions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">Specialized feedback for financial transactions</p>
                  <div className="flex flex-wrap gap-2">
                    <HapticButton onClick={() => { transactionFeedback.onDeposit({ amount: 50 }); addLog('combined', 'Deposit $50'); }}>Deposit $50</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onDeposit({ amount: 500, isLargeTransaction: true }); addLog('combined', 'Large deposit $500'); }}>Large Deposit $500</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onWithdraw(); addLog('combined', 'Withdraw'); }}>Withdraw</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onTransfer(); addLog('combined', 'Transfer'); }}>Transfer</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onPayment(); addLog('combined', 'Payment'); }}>Payment</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onGoalContribution(); addLog('combined', 'Goal contribution'); }}>Goal Contribution</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onDebtPayment({ amount: 200 }); addLog('combined', 'Debt payment'); }}>Debt Payment</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onSubscriptionCancelled(); addLog('combined', 'Subscription cancelled'); }}>Sub Cancelled</HapticButton>
                    <HapticButton onClick={() => { transactionFeedback.onTransactionFailed(); addLog('combined', 'Transaction failed'); }}>Failed</HapticButton>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Ambient Soundscape Section */}
          <Collapsible open={expandedSections.ambient} onOpenChange={() => toggleSection('ambient')}>
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-pink-500" />
                      <CardTitle className="text-lg">Ambient Soundscape</CardTitle>
                    </div>
                    {expandedSections.ambient ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">432Hz-based calming tones with subtle LFO modulation. Auto-mutes when tab is hidden.</p>
                  <AmbientSoundscape />
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Volume</span>
                    <Slider value={ambientVolume} onValueChange={setAmbientVolume} max={100} step={1} className="w-full" />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Feedback Log */}
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Feedback Log</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="text-xs">Clear</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Interact with the demos above to see log entries</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
                        <Badge variant="outline" className={`text-[10px] ${log.type === 'gesture' ? 'border-primary text-primary' : ''} ${log.type === 'haptic' ? 'border-violet-500 text-violet-500' : ''} ${log.type === 'sound' ? 'border-cyan-500 text-cyan-500' : ''} ${log.type === 'combined' ? 'border-emerald-500 text-emerald-500' : ''}`}>
                          {log.type}
                        </Badge>
                        <span className="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                        <span className="text-foreground">{log.action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PreviewWrapper>
  );
}
