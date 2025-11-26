import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VoiceCommand {
  patterns: RegExp[];
  handler: (match: RegExpMatchArray, context?: any) => Promise<CommandResult>;
  description: string;
  examples: string[];
}

export interface CommandResult {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
}

// Command handlers
const checkBalance = async (): Promise<CommandResult> => {
  try {
    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('nickname, institution_name, current_balance')
      .order('current_balance', { ascending: false });

    if (!accounts || accounts.length === 0) {
      return {
        success: true,
        message: "You don't have any connected accounts yet.",
        action: 'show_balances',
        data: [],
      };
    }

    const total = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
    const summary = accounts
      .map((acc) => `${acc.nickname || acc.institution_name}: $${acc.current_balance?.toFixed(2)}`)
      .join(', ');

    return {
      success: true,
      message: `Your total balance is $${total.toFixed(2)}. ${summary}`,
      action: 'show_balances',
      data: accounts,
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    return {
      success: false,
      message: 'Failed to check balance. Please try again.',
    };
  }
};

const checkSpending = async (match: RegExpMatchArray): Promise<CommandResult> => {
  const period = match[1] || 'today';
  
  try {
    let startDate: Date;
    const now = new Date();

    if (period.includes('today')) {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period.includes('week')) {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period.includes('month')) {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .gte('date', startDate.toISOString())
      .lt('amount', 0);

    const total = transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

    return {
      success: true,
      message: `You've spent $${total.toFixed(2)} ${period}.`,
      action: 'show_spending',
      data: { total, period, transactions },
    };
  } catch (error) {
    console.error('Error checking spending:', error);
    return {
      success: false,
      message: 'Failed to check spending. Please try again.',
    };
  }
};

const transferToSavings = async (match: RegExpMatchArray): Promise<CommandResult> => {
  const amountStr = match[1];
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    return {
      success: false,
      message: 'Please specify a valid amount to transfer.',
    };
  }

  return {
    success: true,
    message: `I'll help you transfer $${amount.toFixed(2)} to your savings. Opening transfer form...`,
    action: 'initiate_transfer',
    data: { amount, to: 'savings' },
  };
};

const createGoal = async (match: RegExpMatchArray): Promise<CommandResult> => {
  const goalName = match[1] || 'New Goal';

  return {
    success: true,
    message: `I'll help you create a goal for "${goalName}". Opening goal creation form...`,
    action: 'create_goal',
    data: { name: goalName },
  };
};

const checkBudget = async (): Promise<CommandResult> => {
  try {
    const { data: budgets } = await supabase
      .from('user_budgets')
      .select('id, name, total_limit');

    const { data: spending } = await supabase
      .from('budget_spending')
      .select('budget_id, spent_amount');

    if (!budgets || budgets.length === 0) {
      return {
        success: true,
        message: "You don't have any budgets set up yet.",
        action: 'show_budget',
        data: [],
      };
    }

    const summary = budgets.slice(0, 3).map((b) => {
      const spent = spending?.find((s) => s.budget_id === b.id)?.spent_amount || 0;
      const percentage = (spent / b.total_limit) * 100;
      return `${b.name}: ${percentage.toFixed(0)}% spent`;
    }).join(', ');

    return {
      success: true,
      message: `Budget overview: ${summary}. Would you like to see more details?`,
      action: 'show_budget',
      data: { budgets, spending },
    };
  } catch (error) {
    console.error('Error checking budget:', error);
    return {
      success: false,
      message: 'Failed to check budget. Please try again.',
    };
  }
};

// Command registry
export const voiceCommands: Record<string, VoiceCommand> = {
  checkBalance: {
    patterns: [
      /check\s+(my\s+)?balance/i,
      /what'?s\s+(my\s+)?balance/i,
      /how\s+much\s+(do\s+)?i\s+have/i,
      /show\s+(me\s+)?my\s+balance/i,
    ],
    handler: checkBalance,
    description: 'Check your account balances',
    examples: ['Check my balance', "What's my balance?", 'How much do I have?'],
  },

  checkSpending: {
    patterns: [
      /how\s+much\s+(did\s+)?i\s+spend\s+(today|this\s+week|this\s+month)/i,
      /what\s+(did\s+)?i\s+spend\s+(today|this\s+week|this\s+month)/i,
      /show\s+(me\s+)?my\s+spending\s+(today|this\s+week|this\s+month)/i,
    ],
    handler: checkSpending,
    description: 'Check your spending for a time period',
    examples: ['How much did I spend today?', 'What did I spend this week?'],
  },

  transfer: {
    patterns: [
      /transfer\s+\$?(\d+(?:\.\d+)?)\s+to\s+savings/i,
      /move\s+\$?(\d+(?:\.\d+)?)\s+to\s+savings/i,
      /save\s+\$?(\d+(?:\.\d+)?)/i,
    ],
    handler: transferToSavings,
    description: 'Transfer money to savings',
    examples: ['Transfer $50 to savings', 'Move $100 to savings', 'Save $25'],
  },

  createGoal: {
    patterns: [
      /create\s+a?\s?goal\s+for\s+(.+)/i,
      /new\s+goal\s+for\s+(.+)/i,
      /set\s+a?\s?goal\s+for\s+(.+)/i,
    ],
    handler: createGoal,
    description: 'Create a new savings goal',
    examples: ['Create a goal for vacation', 'New goal for emergency fund'],
  },

  checkBudget: {
    patterns: [
      /check\s+(my\s+)?budget/i,
      /what'?s\s+my\s+budget\s+(status)?/i,
      /show\s+(me\s+)?my\s+budget/i,
      /budget\s+overview/i,
    ],
    handler: checkBudget,
    description: 'Check your budget status',
    examples: ['Check my budget', "What's my budget status?", 'Budget overview'],
  },
};

export const parseVoiceCommand = async (
  transcript: string,
  context?: any
): Promise<CommandResult | null> => {
  const cleanTranscript = transcript.trim().toLowerCase();

  for (const [key, command] of Object.entries(voiceCommands)) {
    for (const pattern of command.patterns) {
      const match = cleanTranscript.match(pattern);
      if (match) {
        console.log(`Matched voice command: ${key}`);
        const result = await command.handler(match, context);
        toast.success(result.message);
        return result;
      }
    }
  }

  return null;
};

export const getCommandSuggestions = (): string[] => {
  return Object.values(voiceCommands)
    .flatMap((cmd) => cmd.examples)
    .slice(0, 6);
};
