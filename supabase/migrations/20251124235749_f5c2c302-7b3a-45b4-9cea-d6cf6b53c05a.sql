-- Create wallet settings table for currency and privacy preferences
CREATE TABLE IF NOT EXISTS public.wallet_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_currency TEXT NOT NULL DEFAULT 'USD',
  hide_balance BOOLEAN NOT NULL DEFAULT false,
  hide_transaction_amounts BOOLEAN NOT NULL DEFAULT false,
  show_transaction_history BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create gas fee alerts table
CREATE TABLE IF NOT EXISTS public.wallet_gas_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chain_id TEXT NOT NULL DEFAULT 'ethereum',
  threshold_gwei NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chain_id)
);

-- Enable RLS
ALTER TABLE public.wallet_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_gas_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_settings
CREATE POLICY "Users can view own wallet settings"
  ON public.wallet_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet settings"
  ON public.wallet_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet settings"
  ON public.wallet_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for wallet_gas_alerts
CREATE POLICY "Users can view own gas alerts"
  ON public.wallet_gas_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gas alerts"
  ON public.wallet_gas_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gas alerts"
  ON public.wallet_gas_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gas alerts"
  ON public.wallet_gas_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at timestamps
CREATE TRIGGER update_wallet_settings_updated_at
  BEFORE UPDATE ON public.wallet_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_gas_alerts_updated_at
  BEFORE UPDATE ON public.wallet_gas_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();