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
    ];

    return commands.some((pattern) => pattern.test(transcript));
  }, []);

  return {
    executeCommand,
    isVoiceCommand,
  };
}
