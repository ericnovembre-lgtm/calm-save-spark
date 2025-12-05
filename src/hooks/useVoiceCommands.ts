import { useCallback } from 'react';
import { parseVoiceCommand, CommandResult } from '@/lib/voice-commands';
import { useNavigate } from 'react-router-dom';

export function useVoiceCommands() {
  const navigate = useNavigate();

  const executeCommand = useCallback(
    async (transcript: string, context?: any): Promise<CommandResult | null> => {
      const result = await parseVoiceCommand(transcript, context);

      if (result?.success && result.action) {
        // Handle navigation based on command action
        switch (result.action) {
          case 'show_balances':
            navigate('/dashboard');
            break;
          case 'show_spending':
            navigate('/transactions');
            break;
          case 'show_budget':
            navigate('/budget');
            break;
          case 'initiate_transfer':
            navigate('/pots');
            break;
          case 'create_goal':
            navigate('/goals');
            break;
          // New navigation actions
          case 'navigate_bills':
            navigate('/subscriptions');
            break;
          case 'navigate_transactions':
            navigate('/transactions');
            break;
          case 'navigate_credit':
            navigate('/credit');
            break;
          case 'navigate_investments':
            navigate('/investments');
            break;
          case 'navigate_coach':
            navigate('/coach');
            break;
          case 'navigate_debts':
            navigate('/debts');
            break;
          case 'navigate_digital-twin':
            navigate('/digital-twin');
            break;
          case 'navigate_guardian':
            navigate('/guardian');
            break;
          case 'navigate_subscriptions':
            navigate('/subscriptions');
            break;
          case 'navigate_analytics':
            navigate('/analytics');
            break;
          case 'navigate_goals':
            navigate('/goals');
            break;
          case 'navigate_settings':
            navigate('/settings');
            break;
        }
      }

      return result;
    },
    [navigate]
  );

  const isVoiceCommand = useCallback((transcript: string): boolean => {
    const commands = [
      /check\s+(my\s+)?balance/i,
      /how\s+much\s+(did\s+)?i\s+spend/i,
      /transfer|move|save\s+\$?\d+/i,
      /create\s+a?\s?goal/i,
      /check\s+(my\s+)?budget/i,
      // New command patterns
      /pay\s+(my\s+)?bills/i,
      /show\s+(upcoming\s+)?bills/i,
      /show\s+(my\s+)?transactions/i,
      /check\s+(my\s+)?credit/i,
      /credit\s+score/i,
      /check\s+(my\s+)?investments/i,
      /show\s+(my\s+)?portfolio/i,
      /talk\s+to\s+(the\s+)?coach/i,
      /financial\s+advice/i,
      /check\s+(my\s+)?debts/i,
      /digital\s+twin/i,
      /security\s+check/i,
      /show\s+(my\s+)?subscriptions/i,
      /analytics/i,
      /insights/i,
      /show\s+(my\s+)?goals/i,
      /open\s+settings/i,
    ];

    return commands.some((pattern) => pattern.test(transcript));
  }, []);

  return {
    executeCommand,
    isVoiceCommand,
  };
}
