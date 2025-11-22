import { Zap, ArrowRight, Percent } from "lucide-react";

interface ActionBlockProps {
  actionConfig: {
    type: 'transfer_to_goal' | 'transfer_to_pot' | 'round_up';
    amount?: number;
    percentage?: number;
    target_name?: string;
    target_id?: string;
  };
  className?: string;
}

export function ActionBlock({ actionConfig, className = "" }: ActionBlockProps) {
  const getIcon = () => {
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
    <div className={`logic-block logic-block-action ${className}`}>
      <div className="logic-block-icon text-blue-400">
        {getIcon()}
      </div>
      <div className="logic-block-content">
        <div className="logic-block-label text-blue-400">ACTION</div>
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
