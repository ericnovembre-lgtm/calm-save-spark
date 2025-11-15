import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Home, Briefcase, Heart, AlertCircle } from 'lucide-react';

interface GameBoardProps {
  session: any;
}

export function GameBoard({ session }: GameBoardProps) {
  const netWorth = Number(session.current_capital);
  const income = Number(session.current_income);
  const expenses = Number(session.current_expenses);
  const debt = Number(session.current_debt);
  const savingsRate = ((income - expenses) / income * 100).toFixed(1);

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Financial Dashboard</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Annual Income</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold">${income.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Annual Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold">${expenses.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Savings Rate</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{savingsRate}%</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Debt</span>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">${debt.toLocaleString()}</p>
        </div>
      </div>

      {session.life_events && session.life_events.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recent Life Events</h4>
          <div className="space-y-2">
            {session.life_events.slice(-3).map((event: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <Heart className="w-4 h-4 mt-0.5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
