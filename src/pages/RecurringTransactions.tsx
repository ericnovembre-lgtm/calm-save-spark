import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, Calendar, DollarSign, AlertTriangle, Sparkles, Filter } from "lucide-react";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { RecurringSummaryCards } from "@/components/recurring/RecurringSummaryCards";
import { RecurringTransactionList } from "@/components/recurring/RecurringTransactionList";
import { RecurringCategoryBreakdown } from "@/components/recurring/RecurringCategoryBreakdown";
import { RecurringOptimization } from "@/components/recurring/RecurringOptimization";
import { RecurringCalendarView } from "@/components/recurring/RecurringCalendarView";
import { Skeleton } from "@/components/ui/skeleton";

const RecurringTransactions = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  const { 
    transactions, 
    isLoading, 
    refetch,
    summary 
  } = useRecurringTransactions();

  const filteredTransactions = filterCategory 
    ? transactions?.filter(t => t.category === filterCategory)
    : transactions;

  return (
    <AppLayout>
      <Helmet>
        <title>Recurring Transactions | $ave+</title>
        <meta name="description" content="Track and optimize your recurring payments and subscriptions" />
      </Helmet>

      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
              Recurring Transactions
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track, analyze, and optimize your recurring payments
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <RecurringSummaryCards summary={summary} />
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all" className="gap-2">
              <DollarSign className="w-4 h-4 hidden sm:block" />
              All
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4 hidden sm:block" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Filter className="w-4 h-4 hidden sm:block" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="optimize" className="gap-2">
              <Sparkles className="w-4 h-4 hidden sm:block" />
              Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Recurring Transactions</CardTitle>
                      <CardDescription>
                        {filteredTransactions?.length || 0} detected recurring payments
                      </CardDescription>
                    </div>
                    {filterCategory && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setFilterCategory(null)}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <RecurringTransactionList 
                    transactions={filteredTransactions || []} 
                    isLoading={isLoading}
                    onCategoryClick={setFilterCategory}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RecurringCalendarView 
                transactions={transactions || []} 
                isLoading={isLoading}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RecurringCategoryBreakdown 
                transactions={transactions || []}
                onCategoryClick={(category) => {
                  setFilterCategory(category);
                  setActiveTab("all");
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RecurringOptimization transactions={transactions || []} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RecurringTransactions;
