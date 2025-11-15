import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function buildFinancialContext(supabase: SupabaseClient, userId: string) {
  const [transactions, goals, debts, accounts] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId),
  ]);

  return {
    recentTransactions: transactions.data || [],
    goals: goals.data || [],
    debts: debts.data || [],
    accounts: accounts.data || [],
  };
}

export async function buildOnboardingContext(supabase: SupabaseClient, userId: string) {
  const [progress, kyc, consents] = await Promise.all([
    supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId),
  ]);

  return {
    progress: progress.data || null,
    kyc: kyc.data || null,
    consents: consents.data || [],
  };
}

export async function buildTaxContext(supabase: SupabaseClient, userId: string) {
  const currentYear = new Date().getFullYear();
  
  const [transactions, documents, deductions] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', `${currentYear}-01-01`)
      .order('date', { ascending: false }),
    supabase
      .from('tax_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('tax_year', currentYear),
    supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', userId)
      .eq('tax_year', currentYear),
  ]);

  return {
    currentYearTransactions: transactions.data || [],
    documents: documents.data || [],
    deductions: deductions.data || [],
    taxYear: currentYear,
  };
}

export async function buildInvestmentContext(supabase: SupabaseClient, userId: string) {
  const [accounts, watchlist, holdings] = await Promise.all([
    supabase
      .from('investment_accounts')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('investment_watchlist')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('crypto_holdings')
      .select('*')
      .eq('user_id', userId),
  ]);

  return {
    investmentAccounts: accounts.data || [],
    watchlist: watchlist.data || [],
    cryptoHoldings: holdings.data || [],
  };
}

export async function buildDebtContext(supabase: SupabaseClient, userId: string) {
  const [debts, strategies, paymentHistory, negotiations] = await Promise.all([
    supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('interest_rate', { ascending: false }),
    supabase
      .from('debt_payoff_strategies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('debt_payment_history')
      .select('*, debts(debt_name)')
      .eq('user_id', userId)
      .order('payment_date', { ascending: false })
      .limit(20),
    supabase
      .from('creditor_negotiations')
      .select('*, debts(debt_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  return {
    debts: debts.data || [],
    strategies: strategies.data || [],
    recentPayments: paymentHistory.data || [],
    negotiations: negotiations.data || [],
  };
}

export async function buildLifePlanContext(supabase: SupabaseClient, userId: string) {
  const [plans, goals, pots, insurance] = await Promise.all([
    supabase
      .from('life_plans')
      .select('*, life_event_costs(*), life_event_checklists(*), life_event_scenarios(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('pots')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active'),
  ]);

  return {
    lifePlans: plans.data || [],
    goals: goals.data || [],
    pots: pots.data || [],
    insurancePolicies: insurance.data || [],
  };
}
