import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { toast } from "sonner";

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export const CurrencyPreference = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_currency')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (profile?.preferred_currency) {
      setSelectedCurrency(profile.preferred_currency);
    }
  }, [profile]);

  const updateCurrency = useMutation({
    mutationFn: async (currency: string) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: currency })
        .eq('id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success("Currency preference updated", {
        description: `All amounts will now be displayed in ${selectedCurrency}`,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update currency", {
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    updateCurrency.mutate(selectedCurrency);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Currency Preference
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred currency for displaying amounts throughout the app
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateCurrency.isPending || selectedCurrency === profile?.preferred_currency}
        >
          {updateCurrency.isPending ? "Saving..." : "Save Preference"}
        </Button>
      </div>

      <div className="p-4 rounded-lg bg-muted/50">
        <p className="text-xs text-muted-foreground">
          💱 Exchange rates are updated daily. Actual conversion rates may vary when making real transactions.
        </p>
      </div>
    </div>
  );
};
