import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useLiquidityData } from '@/hooks/useLiquidityData';
import { supabase } from '@/integrations/supabase/client';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const LiquidityHero = () => {
  const { data: liquidity, isLoading } = useLiquidityData();
  const [insight, setInsight] = useState<string>('Calculating your financial runway...');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Fetch AI insight
  useEffect(() => {
    if (!liquidity) return;

    const fetchInsight = async () => {
      try {
        const { data } = await supabase.functions.invoke('generate-liquidity-insight', {
          body: {
            runway: liquidity.runway,
            safeToSpend: liquidity.safeToSpend,
            upcomingBills: liquidity.upcomingBills,
          },
        });

        if (data?.insight) {
          setInsight(data.insight);
        }
      } catch (error) {
        console.error('Error fetching insight:', error);
        setInsight(`You have ${liquidity.runway} days of runway at your current pace.`);
      }
    };

    fetchInsight();
  }, [liquidity]);

  // Liquid wave animation
  useEffect(() => {
    if (!canvasRef.current || !liquidity || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * 2; // Retina
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const waveHeight = (liquidity.safeToSpend / Math.max(liquidity.totalCash, 1)) * (height / 2);
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Create gradient for liquid
      const gradient = ctx.createLinearGradient(0, 0, 0, height / 2);
      gradient.addColorStop(0, 'hsl(186 80% 65% / 0.6)'); // Cyan-400
      gradient.addColorStop(1, 'hsl(186 80% 75% / 0.4)'); // Cyan-300

      // Draw wave
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let x = 0; x < width / 2; x += 5) {
        const y = (height / 2) - waveHeight + Math.sin((x / 50) + (frame / 10)) * 10;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width / 2, height / 2);
      ctx.lineTo(0, height / 2);
      ctx.closePath();
      ctx.fill();

      frame++;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [liquidity, prefersReducedMotion]);

  if (isLoading || !liquidity) {
    return (
      <div className="relative h-80 rounded-2xl overflow-hidden bg-glass border border-glass-border backdrop-blur-glass animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-80 rounded-2xl overflow-hidden bg-glass border border-glass-border backdrop-blur-glass"
    >
      {/* Liquid wave background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Safe to Spend
          </p>
          <div className="text-6xl font-bold text-foreground tabular-nums">
            $<CountUp end={liquidity.safeToSpend} duration={1.5} decimals={0} separator="," />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-base text-muted-foreground max-w-md"
        >
          {insight}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex gap-8 text-sm"
        >
          <div>
            <p className="text-muted-foreground">Total Cash</p>
            <p className="font-semibold text-foreground">${liquidity.totalCash.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Upcoming Bills</p>
            <p className="font-semibold text-foreground">${liquidity.upcomingBills.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Runway</p>
            <p className="font-semibold text-foreground">{liquidity.runway} days</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};