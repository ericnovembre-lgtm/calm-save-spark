import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Target, Wallet, BarChart3, CreditCard, DollarSign, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Badge } from "@/components/ui/badge";

type SearchCategory = 'all' | 'transactions' | 'goals' | 'pots' | 'budgets' | 'debts';

interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  subtitle?: string;
  amount?: number;
  path: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<SearchCategory>('all');
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search across all data
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedSearch, category],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const searchResults: SearchResult[] = [];

      // Search transactions
      if (category === 'all' || category === 'transactions') {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('id, description, amount, category')
          .eq('user_id', user.id)
          .or(`description.ilike.%${debouncedSearch}%,category.ilike.%${debouncedSearch}%`)
          .limit(5);

        transactions?.forEach(t => {
          searchResults.push({
            id: t.id,
            type: 'transactions',
            title: t.description,
            subtitle: t.category || undefined,
            amount: t.amount,
            path: '/transactions'
          });
        });
      }

      // Search goals
      if (category === 'all' || category === 'goals') {
        const { data: goals } = await supabase
          .from('goals')
          .select('id, name, target_amount, current_amount')
          .eq('user_id', user.id)
          .ilike('name', `%${debouncedSearch}%`)
          .limit(5);

        goals?.forEach(g => {
          searchResults.push({
            id: g.id,
            type: 'goals',
            title: g.name,
            subtitle: `${((g.current_amount || 0) / g.target_amount * 100).toFixed(0)}% complete`,
            amount: g.target_amount,
            path: '/goals'
          });
        });
      }

      // Search pots
      if (category === 'all' || category === 'pots') {
        const { data: pots } = await supabase
          .from('pots')
          .select('id, name, target_amount, current_amount')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .ilike('name', `%${debouncedSearch}%`)
          .limit(5);

        pots?.forEach(p => {
          searchResults.push({
            id: p.id,
            type: 'pots',
            title: p.name,
            subtitle: `$${p.current_amount?.toFixed(2) || '0.00'} saved`,
            amount: p.target_amount,
            path: '/pots'
          });
        });
      }

      // Search debts
      if (category === 'all' || category === 'debts') {
        const { data: debts } = await supabase
          .from('debts')
          .select('id, debt_name, current_balance')
          .eq('user_id', user.id)
          .ilike('debt_name', `%${debouncedSearch}%`)
          .limit(5);

        debts?.forEach(d => {
          searchResults.push({
            id: d.id,
            type: 'debts',
            title: d.debt_name,
            subtitle: 'Debt',
            amount: d.current_balance,
            path: '/debts'
          });
        });
      }

      return searchResults;
    },
    enabled: debouncedSearch.length >= 2
  });

  const getIcon = (type: SearchCategory) => {
    switch (type) {
      case 'transactions':
        return <DollarSign className="w-5 h-5" />;
      case 'goals':
        return <Target className="w-5 h-5" />;
      case 'pots':
        return <Wallet className="w-5 h-5" />;
      case 'budgets':
        return <BarChart3 className="w-5 h-5" />;
      case 'debts':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <SearchIcon className="w-5 h-5" />;
    }
  };

  const categories: { value: SearchCategory; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'transactions', label: 'Transactions' },
    { value: 'goals', label: 'Goals' },
    { value: 'pots', label: 'Pots' },
    { value: 'budgets', label: 'Budgets' },
    { value: 'debts', label: 'Debts' },
  ];

  return (
    <AppLayout>
      <Helmet>
        <title>Search | $ave+</title>
        <meta name="description" content="Search across your financial data" />
      </Helmet>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Search
          </h1>
          <p className="text-muted-foreground">
            Find transactions, goals, pots, and more
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search across all your financial data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 text-lg"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Badge
              key={cat.value}
              variant={category === cat.value ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-2">
          {!searchTerm && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <SearchIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Enter at least 2 characters to search across transactions, goals, pots, budgets, and debts
                </p>
              </CardContent>
            </Card>
          )}

          {searchTerm && debouncedSearch.length >= 2 && !isLoading && results?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <SearchIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Try adjusting your search or changing the category filter
                </p>
              </CardContent>
            </Card>
          )}

          {results?.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => navigate(result.path)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                    )}
                  </div>
                  {result.amount !== undefined && (
                    <div className="text-right">
                      <div className="font-semibold">${result.amount.toFixed(2)}</div>
                      <Badge variant="outline" className="mt-1">{result.type}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
