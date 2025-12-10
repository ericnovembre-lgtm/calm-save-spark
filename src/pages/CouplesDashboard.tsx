import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Heart, Target, Users } from "lucide-react";
import { useCouple, useSharedGoals, useSharedBudgets } from "@/hooks/useCouple";
import { CoupleInvite } from "@/components/couples/CoupleInvite";
import { SharedGoalCard } from "@/components/couples/SharedGoalCard";
import { CreateSharedGoalModal } from "@/components/couples/CreateSharedGoalModal";
import { CombinedNetWorthCard } from "@/components/couples/CombinedNetWorthCard";

export default function CouplesDashboard() {
  const {
    couple,
    isLinked,
    isPending,
    isPartnerA,
    inviteCode,
    isLoading: coupleLoading,
    createCouple,
    isCreating,
    joinCouple,
    isJoining,
  } = useCouple();

  const {
    goals,
    isLoading: goalsLoading,
    createGoal,
    isCreating: isCreatingGoal,
    contribute,
    deleteGoal,
  } = useSharedGoals();

  const {
    budgets,
    isLoading: budgetsLoading,
  } = useSharedBudgets();

  const isLoading = coupleLoading || goalsLoading || budgetsLoading;

  // Not linked yet - show invite flow
  if (!isLinked && !isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-md py-12">
          <CoupleInvite
            inviteCode={inviteCode}
            isPending={isPending}
            onCreateInvite={createCouple}
            onJoinCouple={joinCouple}
            isCreating={isCreating}
            isJoining={isJoining}
          />
        </div>
      </AppLayout>
    );
  }

  const totalGoalProgress = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              Couples Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your shared finances together</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Combined overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <CombinedNetWorthCard
                myNetWorth={45000} // TODO: Get from real data
                partnerNetWorth={38000}
              />
              
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Shared Goals Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-foreground">
                      ${totalGoalProgress.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of ${totalGoalTarget.toLocaleString()} goal
                    </p>
                    <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${totalGoalTarget > 0 ? (totalGoalProgress / totalGoalTarget) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="goals" className="space-y-4">
              <TabsList>
                <TabsTrigger value="goals">Shared Goals ({goals.length})</TabsTrigger>
                <TabsTrigger value="budgets">Shared Budgets ({budgets.length})</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="goals" className="space-y-4">
                <div className="flex justify-end">
                  <CreateSharedGoalModal onCreateGoal={createGoal} isCreating={isCreatingGoal} />
                </div>
                
                {goals.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No Shared Goals Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first shared goal to start saving together
                      </p>
                      <CreateSharedGoalModal onCreateGoal={createGoal} isCreating={isCreatingGoal} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {goals.map(goal => (
                      <SharedGoalCard
                        key={goal.id}
                        goal={goal}
                        isPartnerA={isPartnerA}
                        onContribute={(id, amount) => contribute({ goalId: id, amount })}
                        onDelete={deleteGoal}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="budgets" className="space-y-4">
                {budgets.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No Shared Budgets Yet</h3>
                      <p className="text-muted-foreground">
                        Create shared budgets to track spending together
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {budgets.map(budget => (
                      <Card key={budget.id} className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-foreground">{budget.category}</h3>
                            <span className="text-sm text-muted-foreground">
                              ${budget.current_spent} / ${budget.budget_limit}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                budget.current_spent > budget.budget_limit 
                                  ? 'bg-red-500' 
                                  : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min((budget.current_spent / budget.budget_limit) * 100, 100)}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="settings">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Visibility Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Control what financial information you share with your partner.
                    </p>
                    {couple?.visibility_settings && (
                      <div className="grid gap-4">
                        {Object.entries(couple.visibility_settings).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="capitalize text-foreground">{key}</span>
                            <span className="text-sm text-muted-foreground capitalize">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
