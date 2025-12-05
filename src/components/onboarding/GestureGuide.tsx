import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

type GestureType = 'swipe-horizontal' | 'swipe-vertical' | 'tap' | 'drag' | 'pull-down' | 'pinch';

export function GestureGuide({ type, onComplete, completed }: { type: GestureType; onComplete: () => void; completed: boolean }) {
  const [practicing, setPracticing] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => { if (completed) return; const t = e.touches[0]; startRef.current = { x: t.clientX, y: t.clientY }; setPracticing(true); setProgress(0); };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!practicing || completed) return;
    const t = e.touches[0];
    const dx = t.clientX - startRef.current.x, dy = t.clientY - startRef.current.y;
    let p = 0;
    if (type === 'swipe-horizontal') p = Math.min(Math.abs(dx) / 100, 1);
    else if (type === 'pull-down' || type === 'swipe-vertical') p = Math.min(Math.abs(dy) / 80, 1);
    else if (type === 'drag') p = Math.min((Math.abs(dx) + Math.abs(dy)) / 120, 1);
    setProgress(p);
    if (p >= 1) { triggerHaptic('success'); onComplete(); setPracticing(false); }
  };
  const handleTouchEnd = () => { setPracticing(false); if (progress < 1) setProgress(0); };
  const handleTap = () => { if (type === 'tap' && !completed) { triggerHaptic('light'); setProgress(1); onComplete(); } };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-48 h-48 rounded-2xl border-2 border-dashed transition-colors ${completed ? 'border-green-500/50 bg-green-500/10' : practicing ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 bg-muted/20'}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onClick={handleTap}>
        {practicing && !completed && <motion.div className="absolute inset-0 bg-primary/20 rounded-2xl" initial={{ scale: 0 }} animate={{ scale: progress }} style={{ transformOrigin: 'center' }} />}
        <AnimatePresence>{!completed && !practicing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center"><span className="text-4xl">👆</span></motion.div>}</AnimatePresence>
        {type === 'tap' && !completed && <div className="absolute inset-0 flex items-center justify-center"><motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-primary" /></motion.div></div>}
        {completed && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center"><span className="text-4xl">✅</span></motion.div>}
      </div>
      <p className={`mt-4 text-sm ${completed ? 'text-green-500' : 'text-muted-foreground'}`}>{completed ? 'Perfect!' : type === 'swipe-horizontal' ? 'Swipe left or right' : type === 'tap' ? 'Tap the circle' : type === 'drag' ? 'Drag in any direction' : type === 'pull-down' ? 'Pull down' : 'Try the gesture'}</p>
    </div>
  );
}
