-- Create tax categories enum
CREATE TYPE public.tax_category AS ENUM (
  'office_supplies',
  'equipment',
  'travel',
  'meals',
  'utilities',
  'rent',
  'insurance',
  'professional_services',
  'marketing',
  'software',
  'payroll',
  'other'
);

-- Create invoice status enum
CREATE TYPE public.invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

-- Create business profiles table
CREATE TABLE public.business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  tax_id TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business expenses table
CREATE TABLE public.business_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  category TEXT,
  tax_category public.tax_category,
  tax_deductible BOOLEAN DEFAULT false,
  receipt_url TEXT,
  expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL, -- 'receivable' or 'payable'
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status public.invoice_status DEFAULT 'draft',
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheduled vendor payments table
CREATE TABLE public.scheduled_vendor_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  next_payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_vendor_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_profiles
CREATE POLICY "Users can view own business profile"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile"
  ON public.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile"
  ON public.business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business profile"
  ON public.business_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for vendors
CREATE POLICY "Users can view own vendors"
  ON public.vendors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vendors"
  ON public.vendors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vendors"
  ON public.vendors FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for business_expenses
CREATE POLICY "Users can view own business expenses"
  ON public.business_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business expenses"
  ON public.business_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business expenses"
  ON public.business_expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business expenses"
  ON public.business_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for scheduled_vendor_payments
CREATE POLICY "Users can view own scheduled payments"
  ON public.scheduled_vendor_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled payments"
  ON public.scheduled_vendor_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled payments"
  ON public.scheduled_vendor_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled payments"
  ON public.scheduled_vendor_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_business_expenses_user_id ON public.business_expenses(user_id);
CREATE INDEX idx_business_expenses_date ON public.business_expenses(expense_date);
CREATE INDEX idx_business_expenses_tax_category ON public.business_expenses(tax_category);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_expenses_updated_at
  BEFORE UPDATE ON public.business_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_vendor_payments_updated_at
  BEFORE UPDATE ON public.scheduled_vendor_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();