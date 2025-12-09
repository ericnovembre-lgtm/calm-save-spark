import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw, Settings, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useAccountDetails } from "@/hooks/useAccountDetails";
import { useAccountTransactions } from "@/hooks/useAccountTransactions";
import { AccountBalanceChart } from "@/components/account-details/AccountBalanceChart";
import { AccountTransactionList } from "@/components/account-details/AccountTransactionList";
import { AccountInsights } from "@/components/account-details/AccountInsights";
import { AccountHeader } from "@/components/account-details/AccountHeader";
import { AccountQuickStats } from "@/components/account-details/AccountQuickStats";

const AccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account, isLoading: accountLoading, error } = useAccountDetails(id || '');
  const { transactions, isLoading: txLoading } = useAccountTransactions(id || '');

  if (accountLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !account) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 sm:p-6">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
            <p className="text-muted-foreground mb-4">The account you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/accounts')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Accounts
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>{account.institution_name} | $ave+</title>
        <meta name="description" content={`View details for your ${account.institution_name} account`} />
      </Helmet>

      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/accounts')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Accounts
          </Button>
        </motion.div>

        {/* Account Header */}
        <AccountHeader account={account} />

        {/* Quick Stats */}
        <AccountQuickStats account={account} transactions={transactions} />

        {/* Balance History Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Balance History</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountBalanceChart accountId={account.id} />
            </CardContent>
          </Card>
        </motion.section>

        {/* AI Insights */}
        <AccountInsights accountId={account.id} transactions={transactions} />

        {/* Recent Transactions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/transactions?account=${account.id}`}>
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <AccountTransactionList 
                transactions={transactions?.slice(0, 10) || []} 
                isLoading={txLoading} 
              />
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </AppLayout>
  );
};

export default AccountDetails;
