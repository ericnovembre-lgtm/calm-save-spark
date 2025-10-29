import { Button } from "@/components/ui/button";
import { BalanceCard } from "@/components/BalanceCard";
import { GoalCard } from "@/components/GoalCard";
import { Plus, Zap, ArrowRight } from "lucide-react";

const Index = () => {
  const totalBalance = 3247.85;
  const goals = [
    { title: "Emergency Fund", current: 2400, target: 5000, emoji: "🏥" },
    { title: "Vacation 2025", current: 847.85, target: 2500, emoji: "✈️" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">
            $ave<span className="text-accent-foreground">+</span>
          </h1>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-foreground hover:text-accent-foreground transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Goals
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Rules
            </a>
          </nav>
          <Button variant="outline" size="sm" className="text-sm">
            Profile
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Balance Overview */}
        <BalanceCard balance={totalBalance} />

        {/* Auto-Save CTA */}
        <div className="bg-primary text-primary-foreground rounded-lg p-8 mb-12 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5" />
                <h3 className="font-display font-semibold text-xl">
                  Auto-Save is Active
                </h3>
              </div>
              <p className="text-primary-foreground/90 mb-4 leading-relaxed">
                Your smart rules are working in the background. Every purchase rounds up to the nearest dollar, 
                and 10% of every deposit goes straight to savings.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Adjust Rules
                </Button>
                <button className="text-sm text-primary-foreground/90 hover:text-primary-foreground underline underline-offset-4 transition-colors">
                  View Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Your Goals
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {goals.map((goal, index) => (
              <GoalCard key={index} {...goal} />
            ))}
          </div>
        </div>

        {/* Manual Transfer Option */}
        <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-foreground mb-1">
                Make a Manual Transfer
              </h3>
              <p className="text-sm text-muted-foreground">
                Boost your savings anytime with a one-time transfer
              </p>
            </div>
            <Button className="gap-2">
              Transfer
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-muted-foreground text-center mt-12 max-w-2xl mx-auto">
          $ave+ is not a bank. Funds are held in FDIC-insured partner accounts. 
          All savings transfers are subject to available balance and overdraft protection rules.
        </p>
      </main>
    </div>
  );
};

export default Index;
