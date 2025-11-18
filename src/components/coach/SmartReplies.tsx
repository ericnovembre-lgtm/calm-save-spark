import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface SmartRepliesProps {
  lastMessage: {
    role: string;
    content: string;
  };
  onReplySelect: (reply: string) => void;
  disabled?: boolean;
}

export function SmartReplies({ lastMessage, onReplySelect, disabled }: SmartRepliesProps) {
  if (!lastMessage || lastMessage.role !== 'assistant') return null;

  // Generate contextual smart replies based on assistant's message
  const generateSmartReplies = (content: string): string[] => {
    const lowerContent = content.toLowerCase();
    
    // Budget-related responses
    if (lowerContent.includes('budget') || lowerContent.includes('spending')) {
      return [
        "Show me detailed breakdown",
        "How can I reduce expenses?",
        "Create a budget plan"
      ];
    }
    
    // Goal-related responses
    if (lowerContent.includes('goal') || lowerContent.includes('save') || lowerContent.includes('target')) {
      return [
        "Help me set realistic milestones",
        "What's the best savings strategy?",
        "Show me my progress"
      ];
    }
    
    // Debt-related responses
    if (lowerContent.includes('debt') || lowerContent.includes('loan') || lowerContent.includes('interest')) {
      return [
        "Compare payoff strategies",
        "How much interest am I paying?",
        "Create a payoff plan"
      ];
    }
    
    // Spending analysis
    if (lowerContent.includes('spending') || lowerContent.includes('transaction') || lowerContent.includes('expense')) {
      return [
        "Show top spending categories",
        "Any unusual spending?",
        "Help me cut costs"
      ];
    }
    
    // Generic helpful responses
    return [
      "Tell me more",
      "What should I do next?",
      "Show me the numbers"
    ];
  };

  const smartReplies = generateSmartReplies(lastMessage.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-2"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" />
        <span>Quick replies:</span>
      </div>
      {smartReplies.map((reply, idx) => (
        <Button
          key={idx}
          size="sm"
          variant="outline"
          onClick={() => onReplySelect(reply)}
          disabled={disabled}
          className="text-xs h-7"
        >
          {reply}
        </Button>
      ))}
    </motion.div>
  );
}
