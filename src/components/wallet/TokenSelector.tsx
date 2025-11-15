import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TokenSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TokenSelector({ value, onChange }: TokenSelectorProps) {
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['wallet-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_tokens')
        .select('*')
        .eq('is_active', true)
        .eq('chain', 'ethereum')
        .order('symbol');

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="h-10 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        {tokens?.map((token) => (
          <SelectItem key={token.id} value={token.symbol}>
            <div className="flex items-center gap-2">
              {token.logo_url && (
                <img 
                  src={token.logo_url} 
                  alt={token.symbol}
                  className="h-5 w-5 rounded-full"
                />
              )}
              <span className="font-semibold">{token.symbol}</span>
              <span className="text-muted-foreground text-sm">- {token.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
