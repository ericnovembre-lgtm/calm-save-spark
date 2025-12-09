import { motion } from 'framer-motion';
import { Shield, CreditCard } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Card = Database['public']['Tables']['cards']['Row'];

interface CardDisplayProps {
  card: Card;
  onFreeze?: (cardId: string) => void;
}

export function CardDisplay({ card, onFreeze }: CardDisplayProps) {
  const getCardGradient = (network: string) => {
    switch (network?.toLowerCase()) {
      case 'visa': 
        return 'from-amber-600 to-amber-800';
      case 'mastercard': 
        return 'from-red-600 to-orange-600';
      case 'amex': 
        return 'from-green-600 to-green-800';
      default: 
        return 'from-yellow-600 to-amber-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Visual */}
      <motion.div
        className={`relative w-full max-w-sm mx-auto h-52 rounded-2xl bg-gradient-to-br ${getCardGradient(card.network)} text-white p-6 shadow-xl`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex justify-between items-start mb-8">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="text-xs opacity-80">{card.network?.toUpperCase()}</div>
            <div className="text-sm font-semibold">{card.brand}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-lg font-mono tracking-widest">
            •••• •••• •••• {card.last4}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-80">EXPIRES</div>
            <div className="text-sm font-semibold">
              {String(card.exp_month).padStart(2, '0')}/{card.exp_year}
            </div>
          </div>
          <div className="text-xs opacity-80">
            {card.card_type?.toUpperCase()}
          </div>
        </div>

        {card.status === 'frozen' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-semibold">CARD FROZEN</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Controls */}
      {onFreeze && (
        <div className="flex justify-center">
          <button
            onClick={() => onFreeze(card.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              card.status === 'frozen'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {card.status === 'frozen' ? 'Unfreeze Card' : 'Freeze Card'}
          </button>
        </div>
      )}
    </div>
  );
}
