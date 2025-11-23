import { Zap, ArrowRight, Percent } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";

// Helper to render Lucide icons dynamically
const DynamicIcon = ({ name, className = "" }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[
    name.split('-').map((w: string) => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join('')
  ] || LucideIcons.Zap;
  
  return <IconComponent className={className} />;
};

interface ActionBlockProps {
  actionConfig: {
    type: 'transfer_to_goal' | 'transfer_to_pot' | 'round_up';
    amount?: number;
    percentage?: number;
    target_name?: string;
    target_id?: string;
  };
  icon?: string;
  color?: string;
  className?: string;
}

export function ActionBlock({ actionConfig, icon, color = "blue", className = "" }: ActionBlockProps) {
  const getIcon = () => {
    if (icon) return <DynamicIcon name={icon} className="w-5 h-5" />;
    
    switch (actionConfig.type) {
      case 'round_up':
        return <Percent className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (actionConfig.type) {
      case 'transfer_to_goal':
        return 'Transfer to Goal';
      case 'transfer_to_pot':
        return 'Transfer to Pot';
      case 'round_up':
        return 'Round Up';
      default:
        return 'Action';
    }
  };

  const getDetails = () => {
    const details = [];
    
    if (actionConfig.amount) {
      details.push(`• Amount: $${actionConfig.amount.toFixed(2)}`);
    }
    if (actionConfig.percentage) {
      details.push(`• Percentage: ${actionConfig.percentage}%`);
    }
    if (actionConfig.target_name) {
      details.push(`• Destination: ${actionConfig.target_name}`);
    } else if (!actionConfig.target_id) {
      details.push(`• Destination: (Select below)`);
    }

    return details;
  };

  return (
    <motion.div 
      className={`logic-block logic-block-action border-2 border-${color}-500/30 bg-${color}-500/5 ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className={`logic-block-icon text-${color}-500`}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {getIcon()}
      </motion.div>
      <div className="logic-block-content">
        <div className={`logic-block-label text-${color}-500 font-bold tracking-wider`}>
          ACTION
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
