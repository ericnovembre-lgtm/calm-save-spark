import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function LiveTickerTape({ holdings }: { holdings: any[] }) {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const { isDemoMode } = useDemoMode();

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

    // Get symbols from holdings
    const symbols = holdings.map(h => h.symbol).filter(Boolean);
    if (symbols.length === 0) return;

    // Fetch initial data
    const fetchTickerData = async () => {
      const { data } = await supabase
        .from('market_data_cache')
        .select('symbol, price, change_percent')
        .in('symbol', symbols);

      if (data) {
        setTickerData(data.map(item => ({
          symbol: item.symbol,
          price: parseFloat(String(item.price)),
          change: 0, // Calculate from previous price if needed
          changePercent: parseFloat(String(item.change_percent || 0))
        })));
      }
    };

    fetchTickerData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('market-data-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'market_data_cache',
        filter: `symbol=in.(${symbols.join(',')})`
      }, (payload: any) => {
        setTickerData(prev => {
          const updated = prev.map(item => 
            item.symbol === payload.new.symbol 
              ? {
                  ...item,
                  price: parseFloat(String(payload.new.price)),
                  changePercent: parseFloat(String(payload.new.change_percent || 0))
                }
              : item
          );
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [holdings, isDemoMode]);

  if (tickerData.length === 0) {
    return null;
  }

  // Duplicate for seamless loop
  const duplicatedData = [...tickerData, ...tickerData];

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-800 relative">
      {/* LIVE Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-mono text-slate-300">LIVE</span>
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