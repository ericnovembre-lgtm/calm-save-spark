import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Fuel, TrendingDown, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { supabase } from "@/integrations/supabase/client";

interface GasGuruProps {
  currentGas?: number;
  predictedLow?: number;
  bestTime?: string;
  network?: string;
}

export function GasGuru({
  currentGas = 25,
  predictedLow = 12,
  bestTime = "2-4 AM EST",
  network = "Ethereum",
}: GasGuruProps) {
  const [aiTip, setAiTip] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const congestionLevel = currentGas > 50 ? 'high' : currentGas > 25 ? 'medium' : 'low';
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchGasAdvice = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('wallet-ai-assistant', {
          body: {
            action: 'gas_advice',
            current_gas_gwei: currentGas
          }
        });

        if (!error && data?.tip) {
          setAiTip(data.tip);
        }
      } catch (err) {
        console.error('Gas advice error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGasAdvice();
  }, [currentGas]);

  const getCongestionColor = () => {
    switch (congestionLevel) {
      case 'high': return 'bg-red-500 animate-pulse';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  const getCongestionLabel = () => {
    switch (congestionLevel) {
      case 'high': return '🔴 High';
      case 'medium': return '🟡 Medium';
      default: return '🟢 Low';
    }
  };

  const savingsAmount = currentGas > predictedLow ? ((currentGas - predictedLow) * 21000 * 0.000000001 * 3000) : 0;
  const savings = savingsAmount.toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute -right-10 -top-10 h-32 w-32 bg-orange-500/10 blur-3xl rounded-full" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
            <Fuel size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Gas Guru</h3>
            <p className="text-xs text-slate-400">{network} Network</p>
          </div>
        </div>

        {/* Current Gas Price */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-2">Current Average Fee</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{currentGas}</span>
            <span className="text-lg text-slate-400">Gwei</span>
          </div>
        </div>

        {/* Fee Comparison Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Slow', gwei: currentGas * 0.8, time: '~10 min', color: 'emerald' },
            { label: 'Standard', gwei: currentGas, time: '~3 min', color: 'blue' },
            { label: 'Fast', gwei: currentGas * 1.2, time: '~30 sec', color: 'violet' }
          ].map((option) => (
            <button
              key={option.label}
              className="bg-slate-900/50 border border-white/10 hover:border-white/30 rounded-xl p-3 transition-all hover:bg-slate-900"
            >
              <p className="text-xs text-slate-400 mb-1">{option.label}</p>
              <p className="text-lg font-bold text-white">{Math.round(option.gwei)}</p>
              <p className="text-[10px] text-slate-500">{option.time}</p>
            </button>
          ))}
        </div>

        {/* AI Prediction Panel */}
        <div className="mt-4 bg-slate-900/50 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getCongestionColor()}`} />
              <span className="text-xs font-bold uppercase text-slate-400">
                {getCongestionLabel()} Congestion
              </span>
            </div>
            {loading && <Loader2 size={14} className="animate-spin text-violet-400" />}
          </div>
          
          {aiTip && (
            <div className="flex items-start gap-2 text-xs mb-3 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
              <Sparkles size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">{aiTip}</span>
            </div>
          )}
          
          <p className="text-sm text-white mb-3">
            💡 Gas typically drops to ~{predictedLow} Gwei during {bestTime}
          </p>
          
          {savingsAmount > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-400">
                Potential savings: <span className="font-bold text-emerald-500">${savings}</span> per transaction
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
