import { Target, Calendar, TrendingUp, Percent } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";

// Helper to render Lucide icons dynamically
const DynamicIcon = ({ name, className = "" }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[
    name.split('-').map((w: string) => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join('')
  ] || LucideIcons.Target;
  
  return <IconComponent className={className} />;
};

interface TriggerBlockProps {
  triggerCondition: {
    type: 'transaction_match' | 'date_based' | 'balance_threshold';
    merchant?: string;
    category?: string;
    frequency?: string;
    day_of_week?: string;
    balance_threshold?: number;
  };
  icon?: string;
  color?: string;
  className?: string;
}

export function TriggerBlock({ triggerCondition, icon, color = "green", className = "" }: TriggerBlockProps) {
  const getIcon = () => {
    if (icon) return <DynamicIcon name={icon} className="w-5 h-5" />;
    
    switch (triggerCondition.type) {
      case 'transaction_match':
        return <Target className="w-5 h-5" />;
      case 'date_based':
        return <Calendar className="w-5 h-5" />;
      case 'balance_threshold':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (triggerCondition.type) {
      case 'transaction_match':
        return 'Transaction Match';
      case 'date_based':
        return 'Scheduled';
      case 'balance_threshold':
        return 'Balance Trigger';
      default:
        return 'Trigger';
    }
  };

  const getDetails = () => {
    const details = [];
    
    if (triggerCondition.merchant) {
      details.push(`• Merchant: ${triggerCondition.merchant}`);
    }
    if (triggerCondition.category) {
      details.push(`• Category: ${triggerCondition.category}`);
    }
    if (triggerCondition.frequency) {
      details.push(`• Frequency: ${triggerCondition.frequency}`);
    }
    if (triggerCondition.day_of_week) {
      details.push(`• Day: ${triggerCondition.day_of_week}`);
    }
    if (triggerCondition.balance_threshold) {
      details.push(`• Threshold: $${triggerCondition.balance_threshold.toFixed(2)}`);
    }

    return details;
  };

  return (
    <motion.div 
      className={`logic-block logic-block-trigger border-2 border-${color}-500/30 bg-${color}-500/5 ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className={`logic-block-icon text-${color}-500`}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {getIcon()}
      </motion.div>
      <div className="logic-block-content">
        <div className={`logic-block-label text-${color}-500 font-bold tracking-wider`}>
          TRIGGER
        </div>
        <div className="logic-block-title">{getTitle()}</div>
        <div className="logic-block-details">
          {getDetails().map((detail, i) => (
            <div key={i}>{detail}</div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
