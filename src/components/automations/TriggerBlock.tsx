import { Target, Calendar, TrendingUp, Percent } from "lucide-react";

interface TriggerBlockProps {
  triggerCondition: {
    type: 'transaction_match' | 'date_based' | 'balance_threshold';
    merchant?: string;
    category?: string;
    frequency?: string;
    day_of_week?: string;
    balance_threshold?: number;
  };
  className?: string;
}

export function TriggerBlock({ triggerCondition, className = "" }: TriggerBlockProps) {
  const getIcon = () => {
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
    <div className={`logic-block logic-block-trigger ${className}`}>
      <div className="logic-block-icon text-green-400">
        {getIcon()}
      </div>
      <div className="logic-block-content">
        <div className="logic-block-label text-green-400">TRIGGER</div>
        <div className="logic-block-title">{getTitle()}</div>
        <div className="logic-block-details">
          {getDetails().map((detail, i) => (
            <div key={i}>{detail}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
