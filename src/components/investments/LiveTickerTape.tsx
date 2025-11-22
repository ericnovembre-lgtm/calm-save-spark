import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function LiveTickerTape({ holdings }: { holdings: any[] }) {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);

  useEffect(() => {
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
  }, [holdings]);

  if (tickerData.length === 0) {
    return null;
  }

  // Duplicate for seamless loop
  const duplicatedData = [...tickerData, ...tickerData];

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden border border-border">
      <div className="relative h-16 overflow-hidden">
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
              <span className="font-bold text-foreground">{item.symbol}</span>
              <span className="text-foreground">${item.price.toFixed(2)}</span>
              <span className={`flex items-center gap-1 ${
                item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
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