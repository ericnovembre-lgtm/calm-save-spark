import { Calendar, DollarSign, ShoppingBag, Zap, Filter, Clock, Target, AlertCircle, Percent } from "lucide-react";
import { motion } from "framer-motion";

interface BlockTemplate {
  type: 'trigger' | 'condition' | 'action';
  category: string;
  label: string;
  icon: React.ReactNode;
  config: Record<string, any>;
}

const triggerTemplates: BlockTemplate[] = [
  {
    type: 'trigger',
    category: 'transaction_match',
    label: 'Transaction Match',
    icon: <ShoppingBag className="w-4 h-4" />,
    config: { merchant: '', category: '', amount_min: 0 },
  },
  {
    type: 'trigger',
    category: 'date_based',
    label: 'Date-Based',
    icon: <Calendar className="w-4 h-4" />,
    config: { frequency: 'daily' },
  },
  {
    type: 'trigger',
    category: 'balance_threshold',
    label: 'Balance Threshold',
    icon: <DollarSign className="w-4 h-4" />,
    config: { threshold: 1000, operator: '>' },
  },
];

const conditionTemplates: BlockTemplate[] = [
  {
    type: 'condition',
    category: 'amount_filter',
    label: 'If Amount >',
    icon: <Filter className="w-4 h-4" />,
    config: { amount: 0, operator: '>' },
  },
  {
    type: 'condition',
    category: 'merchant_contains',
    label: 'If Merchant Contains',
    icon: <ShoppingBag className="w-4 h-4" />,
    config: { pattern: '' },
  },
  {
    type: 'condition',
    category: 'day_of_week',
    label: 'If Day of Week',
    icon: <Clock className="w-4 h-4" />,
    config: { days: [] },
  },
];

const actionTemplates: BlockTemplate[] = [
  {
    type: 'action',
    category: 'transfer_to_goal',
    label: 'Transfer to Goal',
    icon: <Target className="w-4 h-4" />,
    config: { amount: 0, target_id: '' },
  },
  {
    type: 'action',
    category: 'transfer_to_pot',
    label: 'Transfer to Pot',
    icon: <DollarSign className="w-4 h-4" />,
    config: { amount: 0, pot_name: '' },
  },
  {
    type: 'action',
    category: 'round_up',
    label: 'Round Up',
    icon: <Percent className="w-4 h-4" />,
    config: { target_id: '' },
  },
  {
    type: 'action',
    category: 'send_alert',
    label: 'Send Alert',
    icon: <AlertCircle className="w-4 h-4" />,
    config: { message: '' },
  },
];

interface BlockPaletteProps {
  type: 'trigger' | 'condition' | 'action';
  onSelectBlock: (template: BlockTemplate) => void;
}

export function BlockPalette({ type, onSelectBlock }: BlockPaletteProps) {
  const templates = type === 'trigger' ? triggerTemplates : type === 'condition' ? conditionTemplates : actionTemplates;
  const colorClass = type === 'trigger' ? 'border-green-400/50 bg-green-950/20' : 
                     type === 'condition' ? 'border-yellow-400/50 bg-yellow-950/20' : 
                     'border-amber-400/50 bg-amber-950/20';

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {type === 'trigger' ? 'Triggers' : type === 'condition' ? 'Conditions' : 'Actions'}
      </h3>
      <div className="space-y-2">
        {templates.map((template, idx) => (
          <motion.button
            key={idx}
            onClick={() => onSelectBlock(template)}
            className={`w-full p-3 rounded-lg border ${colorClass} hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-left group`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`p-2 rounded ${type === 'trigger' ? 'bg-green-400/10 text-green-400' : type === 'condition' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-amber-400/10 text-amber-400'}`}>
              {template.icon}
            </div>
            <span className="text-sm font-medium">{template.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
