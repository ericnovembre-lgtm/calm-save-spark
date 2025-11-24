import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useMarketWebSocket } from '@/hooks/useMarketWebSocket';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function LiveTickerTape({ holdings }: { holdings: any[] }) {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const { isDemoMode } = useDemoMode();
  
  const symbols = holdings.map(h => h.symbol).filter(Boolean);
  const { data: wsData, isConnected, error } = useMarketWebSocket(isDemoMode ? [] : symbols);

  useEffect(() => {
    // In demo mode, use holdings data directly
    if (isDemoMode && holdings.length > 0) {
      setTickerData(holdings.map(h => ({
        symbol: h.symbol,
        price: h.price || 0,
        change: h.change || 0,
        changePercent: h.change_percent || h.change || 0
      })));
      return;
    }

    // Use WebSocket data when available
    if (Object.keys(wsData).length > 0) {
      setTickerData(Object.values(wsData).map(d => ({
        symbol: d.symbol,
        price: d.price,
        change: d.change,
        changePercent: d.changePercent
      })));
    }
  }, [holdings, isDemoMode, wsData]);

  if (tickerData.length === 0) {
    return null;
  }

  // Duplicate for seamless loop
  const duplicatedData = [...tickerData, ...tickerData];

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-800 relative">
      {/* Connection Status Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          isConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-slate-800/80 border-slate-700'
        } border`}>
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-xs font-mono text-green-500">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-mono text-slate-400">{isDemoMode ? 'DEMO' : 'OFFLINE'}</span>
            </>
          )}
        </div>
      </div>

      <div className="relative h-16 overflow-hidden bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50">
        <motion.div
          className="flex gap-8 absolute whitespace-nowrap"
          animate={{
            x: [0, -50 * tickerData.length + '%']
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {duplicatedData.map((item, idx) => (
            <div 
              key={`${item.symbol}-${idx}`}
              className="flex items-center gap-4 px-6 h-16"
            >
              {/* Pulsing Indicator */}
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  item.changePercent >= 0 ? 'bg-green-400' : 'bg-red-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  item.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
              </span>
              
              <span className="font-bold font-mono text-slate-100">{item.symbol}</span>
              <span className="font-mono tabular-nums text-slate-200">${item.price.toFixed(2)}</span>
              <span className={`flex items-center gap-1 font-mono tabular-nums ${
                item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}