import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { haptics } from '@/lib/haptics';
import { OnboardingStep } from './OnboardingStep';
import { GestureGuide } from './GestureGuide';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = [
  { key: 'welcome', title: 'Welcome to $ave+', description: 'Your calm, intelligent financial companion', gesture: null, icon: '✨' },
  { key: 'swipe_nav', title: 'Swipe to Navigate', description: 'Swipe from edges to move between sections', gesture: 'swipe-horizontal' as const, icon: '👆' },
  { key: 'quick_add', title: 'Quick Add Transactions', description: 'Tap + or use voice to add transactions', gesture: 'tap' as const, icon: '➕' },
  { key: 'goals', title: 'Set Your Goals', description: 'Drag to set savings targets', gesture: 'drag' as const, icon: '🎯' },
  { key: 'pull_refresh', title: 'Pull to Refresh', description: 'Pull down to refresh data', gesture: 'pull-down' as const, icon: '🔄' },
  { key: 'complete', title: "You're All Set!", description: 'Start your financial wellness journey', gesture: null, icon: '🎉' },
];

export function MobileOnboardingFlow({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [gestureSuccess, setGestureSuccess] = useState(false);
  const { user } = useAuth();
  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const saveProgress = async (key: string) => { if (user) await supabase.from('mobile_onboarding_progress').upsert({ user_id: user.id, step_key: key, practice_success: true }, { onConflict: 'user_id,step_key' }); };

  const handleNext = async () => {
    haptics.vibrate('light');
    await saveProgress(step.key);
    if (isLastStep) { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); haptics.pattern('success'); onComplete(); }
    else { setCurrentStep(p => p + 1); setGestureSuccess(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex gap-2">{STEPS.map((_, i) => <div key={i} className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-8 bg-primary' : i < currentStep ? 'w-4 bg-primary/50' : 'w-4 bg-muted'}`} />)}</div>
        <Button variant="ghost" size="sm" onClick={() => { haptics.vibrate('light'); onSkip(); }}>Skip <X className="ml-1 h-4 w-4" /></Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div key={step.key} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-sm text-center">
            <OnboardingStep icon={step.icon} title={step.title} description={step.description} />
            {step.gesture && <div className="mt-8"><GestureGuide type={step.gesture} onComplete={() => { setGestureSuccess(true); haptics.pattern('success'); }} completed={gestureSuccess} /></div>}
            {gestureSuccess && step.gesture && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 flex items-center justify-center gap-2 text-green-500"><Sparkles className="h-5 w-5" /><span className="text-sm font-medium">Great job!</span></motion.div>}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="p-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => { haptics.vibrate('light'); setCurrentStep(p => Math.max(0, p - 1)); setGestureSuccess(false); }} disabled={currentStep === 0}><ChevronLeft className="h-4 w-4" />Back</Button>
        <Button onClick={handleNext} disabled={step.gesture && !gestureSuccess}>{isLastStep ? "Let's Go!" : 'Next'}{!isLastStep && <ChevronRight className="h-4 w-4" />}</Button>
      </div>
    </motion.div>
  );
}
