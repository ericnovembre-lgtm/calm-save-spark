import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/LoadingState";
import { Search, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

export const TransactionList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, connected_accounts(institution_name)')
        .order('transaction_date', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const categories = Array.from(
    new Set(transactions?.map(t => t.category) || [])
  );

  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = 
      tx.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || tx.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredTransactions?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
          </div>
        ) : (
          filteredTransactions?.map((tx) => (
            <div
              key={tx.id}
              className="bg-card rounded-lg p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">
                      {tx.merchant || 'Unknown Merchant'}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      {tx.category}
                    </span>
                  </div>
                  {tx.description && (
                    <p className="text-sm text-muted-foreground mb-2">{tx.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(tx.transaction_date), 'MMM dd, yyyy')}
                    </span>
                    {tx.connected_accounts?.institution_name && (
                      <span>{tx.connected_accounts.institution_name}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold tabular-nums ${
                    parseFloat(String(tx.amount)) < 0 ? 'text-green-500' : 'text-foreground'
                  }`}>
                    {parseFloat(String(tx.amount)) < 0 ? '+' : '-'}${Math.abs(parseFloat(String(tx.amount))).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
