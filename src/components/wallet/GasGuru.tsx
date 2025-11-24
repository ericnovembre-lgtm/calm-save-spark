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
  currentGas: propGas,
  predictedLow = 12,
  bestTime = "2-4 AM EST",
  network = "Ethereum",
}: GasGuruProps) {
  const [currentGas, setCurrentGas] = useState(propGas || 25);
  const [gasTip, setGasTip] = useState<{ fee: string; tip: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Simulate dynamic gas price (10-60 gwei range)
    const simulatedGas = Math.floor(Math.random() * 50) + 10;
    setCurrentGas(simulatedGas);

    const fetchGasAdvice = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('wallet-ai-assistant', {
          body: {
            action: 'gas_advice',
            current_gas_gwei: simulatedGas
          }
        });

        if (!error && data) {
          setGasTip(data);
        }
      } catch (err) {
        console.error('Gas advice error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGasAdvice();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        {/* Left: Fee Estimate */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Fuel className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Est. Fee</div>
            <div className="text-lg font-bold text-white">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                gasTip?.fee || "~$4.20"
              )}
            </div>
          </div>
        </div>

        {/* Right: Witty Tip */}
        <div className="flex items-start gap-2 max-w-[60%]">
          <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            {loading ? (
              <span className="text-slate-500">Analyzing traffic...</span>
            ) : (
              gasTip?.tip || "Network is calm, smooth sailing ahead!"
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
