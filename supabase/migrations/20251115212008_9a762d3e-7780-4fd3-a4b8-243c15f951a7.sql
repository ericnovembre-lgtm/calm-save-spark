-- Enable realtime for budget tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_spending;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_categories;