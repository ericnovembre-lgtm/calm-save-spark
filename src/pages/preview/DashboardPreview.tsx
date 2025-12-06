/**
 * DashboardPreview - Simplified preview of Dashboard page
 * Shows core layout and widgets with mock data
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Wallet, TrendingUp, Target, PiggyBank, CreditCard, 
  Bell, ArrowUpRight, ArrowDownRight, Sparkles, Shield
} from "lucide-react";
import { PreviewWrapper } from '@/components/debug/PreviewWrapper';

// Mock data
const mockBalance = 12847.50;
const mockMonthlyChange = 1234.56;
const mockGoals = [
  { name: "Emergency Fund", current: 8500, target: 10000, color: "bg-emerald-500" },
  { name: "Vacation", current: 2400, target: 5000, color: "bg-blue-500" },
  { name: "New Car", current: 3200, target: 15000, color: "bg-violet-500" },
];
const mockTransactions = [
  { merchant: "Whole Foods", amount: -67.32, date: "Today" },
  { merchant: "Payroll Deposit", amount: 3250.00, date: "Yesterday" },
  { merchant: "Netflix", amount: -15.99, date: "Dec 1" },
  { merchant: "Gas Station", amount: -45.00, date: "Nov 30" },
];

export default function DashboardPreview() {
  return (
    <PreviewWrapper pageName="Dashboard">
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Good morning!</h1>
              <p className="text-muted-foreground">Here's your financial snapshot</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="h-4 w-4" />
              3 alerts
            </Button>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Total Balance
                      </p>
                      <p className="text-4xl font-bold text-foreground mt-2">
                        ${mockBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                          <ArrowUpRight className="h-4 w-4" />
                          ${mockMonthlyChange.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-sm">this month</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">Transfer</Button>
                      <Button size="sm">Add Money</Button>
                    </div>
                  </div>
                  
                  {/* Mini chart with gradient bars */}
                  <div className="mt-6 h-24 flex items-end gap-1">
                    {[40, 55, 45, 60, 75, 65, 80, 70, 85, 90, 78, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${h}%`, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.05, type: 'spring', damping: 15, stiffness: 120 }}
                        className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/60 via-cyan-400/50 to-cyan-300/30"
                        style={{
                          boxShadow: '0 0 10px rgba(34, 211, 238, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Savings Rate</p>
                    <p className="text-xl font-semibold">24%</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Score</p>
                    <p className="text-xl font-semibold">742 <span className="text-xs text-emerald-500">+5</span></p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Shield className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Security Score</p>
                    <p className="text-xl font-semibold">83/100</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Savings Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockGoals.map((goal, i) => {
                    const progressValue = (goal.current / goal.target) * 100;
                    const gradientClass = goal.color === "bg-emerald-500" 
                      ? "from-emerald-500 to-emerald-400"
                      : goal.color === "bg-blue-500"
                      ? "from-blue-500 to-cyan-400"
                      : "from-violet-500 to-purple-400";
                    const glowColor = goal.color === "bg-emerald-500"
                      ? "rgba(16,185,129,0.35)"
                      : goal.color === "bg-blue-500"
                      ? "rgba(59,130,246,0.35)"
                      : "rgba(139,92,246,0.35)";
                    return (
                      <div key={goal.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{goal.name}</span>
                          <span className="text-muted-foreground">
                            ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
                            style={{ boxShadow: `0 0 12px ${glowColor}` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    <PiggyBank className="h-4 w-4 mr-2" />
                    Add New Goal
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Recent Transactions
                    </span>
                    <Button variant="ghost" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockTransactions.map((tx, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                          {tx.amount > 0 ? (
                            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.merchant}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${tx.amount > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Insights Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-blue-500/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">AI Insight</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on your spending patterns, you could save an extra $127/month by 
                      reducing subscription services. You're also on track to hit your Emergency 
                      Fund goal 2 weeks early!
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="secondary">View Details</Button>
                      <Button size="sm" variant="ghost">Dismiss</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </PreviewWrapper>
  );
}
