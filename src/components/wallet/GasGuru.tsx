import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface GasGuruProps {
  currentGas?: number;
  predictedLow?: number;
  bestTime?: string;
  network?: string;
}

export function GasGuru({
  currentGas = 15,
  predictedLow = 4,
  bestTime = "2:00 AM",
  network = "Ethereum",
}: GasGuruProps) {
  const [congestionLevel, setCongestionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (currentGas < 5) setCongestionLevel('low');
    else if (currentGas < 15) setCongestionLevel('medium');
    else setCongestionLevel('high');
  }, [currentGas]);

  const getCongestionColor = () => {
    switch (congestionLevel) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
    }
  };

  const getCongestionLabel = () => {
    switch (congestionLevel) {
      case 'low': return '🟢 Low Congestion';
      case 'medium': return '🟡 Medium Congestion';
      case 'high': return '🔴 High Congestion';
    }
  };

  const savings = Math.round(((currentGas - predictedLow) / currentGas) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/60 backdrop-blur-xl rounded-2xl border-2 border-border p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className={`w-6 h-6 ${getCongestionColor()}`} />
          </motion.div>
          <div>
            <h3 className="font-bold text-foreground">Gas Guru</h3>
            <p className="text-xs text-muted-foreground">{network} Network</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">${currentGas}</div>
          <div className="text-xs text-muted-foreground">Current Fee</div>
        </div>
      </div>

      {/* Congestion Gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${getCongestionColor()}`}>
            {getCongestionLabel()}
          </span>
          <span className="text-muted-foreground">Average Fee</span>
        </div>
        
        <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              congestionLevel === 'low' ? 'bg-success' :
              congestionLevel === 'medium' ? 'bg-warning' :
              'bg-destructive'
            }`}
            initial={{ width: 0 }}
            animate={{ 
              width: congestionLevel === 'low' ? '30%' :
                     congestionLevel === 'medium' ? '60%' : '90%'
            }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* AI Prediction */}
      {savings > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-accent/10 border border-accent/20 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-accent mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground">
                💡 Fees typically drop {savings}% after {bestTime}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingDown className="w-3 h-3" />
                  <span>Predicted: ${predictedLow}</span>
                </div>
                <div className="flex items-center gap-1 text-success">
                  <span>Save ${currentGas - predictedLow}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fee Comparison */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Slow', price: currentGas * 0.7, time: '~10 min' },
          { label: 'Standard', price: currentGas, time: '~3 min' },
          { label: 'Fast', price: currentGas * 1.3, time: '~30 sec' },
        ].map((option, i) => (
          <button
            key={i}
            className="p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
          >
            <div className="text-xs text-muted-foreground mb-1">{option.label}</div>
            <div className="text-sm font-bold text-foreground">
              ${option.price.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{option.time}</div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}