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

// Navigation command handlers
const navigateToPage = (page: string, message: string): CommandResult => ({
  success: true,
  message,
  action: `navigate_${page}`,
  data: { page },
});

const viewBills = async (): Promise<CommandResult> => {
  return navigateToPage('bills', 'Opening your upcoming bills...');
};

const viewTransactions = async (): Promise<CommandResult> => {
  return navigateToPage('transactions', 'Showing your recent transactions...');
};

const checkCredit = async (): Promise<CommandResult> => {
  return navigateToPage('credit', 'Opening your credit score overview...');
};

const viewInvestments = async (): Promise<CommandResult> => {
  return navigateToPage('investments', 'Showing your investment portfolio...');
};

const openCoach = async (): Promise<CommandResult> => {
  return navigateToPage('coach', 'Opening your AI financial coach...');
};

const viewDebts = async (): Promise<CommandResult> => {
  return navigateToPage('debts', 'Showing your debt overview...');
};

const openDigitalTwin = async (): Promise<CommandResult> => {
  return navigateToPage('digital-twin', 'Opening your financial digital twin...');
};

const openSecurity = async (): Promise<CommandResult> => {
  return navigateToPage('guardian', 'Opening the security center...');
};

const viewSubscriptions = async (): Promise<CommandResult> => {
  return navigateToPage('subscriptions', 'Showing your subscriptions...');
};

const viewAnalytics = async (): Promise<CommandResult> => {
  return navigateToPage('analytics', 'Opening your financial analytics...');
};

const viewGoals = async (): Promise<CommandResult> => {
  return navigateToPage('goals', 'Showing your savings goals...');
};

const openSettings = async (): Promise<CommandResult> => {
  return navigateToPage('settings', 'Opening settings...');
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

  // New navigation commands
  viewBills: {
    patterns: [
      /pay\s+(my\s+)?bills/i,
      /show\s+(upcoming\s+)?bills/i,
      /what\s+bills\s+(are\s+)?due/i,
      /upcoming\s+bills/i,
    ],
    handler: viewBills,
    description: 'View your upcoming bills',
    examples: ['Pay my bills', 'Show upcoming bills', 'What bills are due?'],
  },

  viewTransactions: {
    patterns: [
      /show\s+(my\s+)?transactions/i,
      /recent\s+purchases/i,
      /what\s+(did\s+)?i\s+buy/i,
      /transaction\s+history/i,
    ],
    handler: viewTransactions,
    description: 'View your transactions',
    examples: ['Show transactions', 'Recent purchases', 'What did I buy?'],
  },

  checkCredit: {
    patterns: [
      /check\s+(my\s+)?credit/i,
      /credit\s+score/i,
      /show\s+(my\s+)?credit/i,
      /what'?s\s+my\s+credit\s+score/i,
    ],
    handler: checkCredit,
    description: 'Check your credit score',
    examples: ['Check my credit', 'Credit score', "What's my credit score?"],
  },

  viewInvestments: {
    patterns: [
      /check\s+(my\s+)?investments/i,
      /show\s+(my\s+)?portfolio/i,
      /how\s+are\s+my\s+stocks/i,
      /investment\s+portfolio/i,
    ],
    handler: viewInvestments,
    description: 'View your investments',
    examples: ['Check investments', 'Show portfolio', 'How are my stocks?'],
  },

  openCoach: {
    patterns: [
      /talk\s+to\s+(the\s+)?coach/i,
      /financial\s+advice/i,
      /help\s+me\s+save/i,
      /open\s+(the\s+)?coach/i,
      /ai\s+coach/i,
    ],
    handler: openCoach,
    description: 'Open the AI financial coach',
    examples: ['Talk to coach', 'Financial advice', 'Help me save'],
  },

  viewDebts: {
    patterns: [
      /check\s+(my\s+)?debts/i,
      /show\s+(my\s+)?loans/i,
      /what\s+do\s+i\s+owe/i,
      /debt\s+overview/i,
    ],
    handler: viewDebts,
    description: 'View your debts',
    examples: ['Check debts', 'Show loans', 'What do I owe?'],
  },

  openDigitalTwin: {
    patterns: [
      /future\s+planning/i,
      /project\s+(my\s+)?finances/i,
      /simulate\s+(my\s+)?finances/i,
      /digital\s+twin/i,
      /financial\s+projection/i,
    ],
    handler: openDigitalTwin,
    description: 'Open your financial digital twin',
    examples: ['Future planning', 'Project finances', 'Digital twin'],
  },

  openSecurity: {
    patterns: [
      /security\s+check/i,
      /protect\s+(my\s+)?account/i,
      /guardian/i,
      /security\s+center/i,
    ],
    handler: openSecurity,
    description: 'Open the security center',
    examples: ['Security check', 'Protect my account', 'Guardian'],
  },

  viewSubscriptions: {
    patterns: [
      /show\s+(my\s+)?subscriptions/i,
      /cancel\s+subscription/i,
      /recurring\s+payments/i,
      /subscription\s+list/i,
    ],
    handler: viewSubscriptions,
    description: 'View your subscriptions',
    examples: ['Show subscriptions', 'Recurring payments', 'Subscription list'],
  },

  viewAnalytics: {
    patterns: [
      /analytics/i,
      /insights/i,
      /spending\s+patterns/i,
      /financial\s+insights/i,
    ],
    handler: viewAnalytics,
    description: 'View your financial analytics',
    examples: ['Analytics', 'Insights', 'Spending patterns'],
  },

  viewGoals: {
    patterns: [
      /show\s+(my\s+)?goals/i,
      /savings\s+goals/i,
      /my\s+goals/i,
      /goal\s+progress/i,
    ],
    handler: viewGoals,
    description: 'View your savings goals',
    examples: ['Show my goals', 'Savings goals', 'Goal progress'],
  },

  openSettings: {
    patterns: [
      /open\s+settings/i,
      /settings/i,
      /preferences/i,
    ],
    handler: openSettings,
    description: 'Open settings',
    examples: ['Open settings', 'Settings', 'Preferences'],
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
