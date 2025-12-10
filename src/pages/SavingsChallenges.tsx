import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trophy, Flame, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSavingsChallenges } from "@/hooks/useSavingsChallenges";
import { PersonalChallengeCard } from "@/components/savings-challenges/PersonalChallengeCard";
import { CreateChallengeModal } from "@/components/savings-challenges/CreateChallengeModal";
import { ChallengeTemplates } from "@/components/savings-challenges/ChallengeTemplates";

export default function SavingsChallenges() {
  const {
    activeChallenges,
    completedChallenges,
    isLoading,
    createChallenge,
    isCreating,
    updateProgress,
    deleteChallenge,
  } = useSavingsChallenges();

  const totalStreak = activeChallenges.reduce((sum, c) => sum + c.streak_count, 0);
  const totalSaved = [...activeChallenges, ...completedChallenges].reduce((sum, c) => sum + c.current_amount, 0);

  return (
    <AppLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Savings Challenges</h1>
            <p className="text-muted-foreground">Push yourself to save more with fun challenges</p>
          </div>
          <CreateChallengeModal onCreateChallenge={createChallenge} isCreating={isCreating} />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStreak}</p>
                <p className="text-sm text-muted-foreground">Total Streak Days</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeChallenges.length}</p>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totalSaved.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Saved</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {activeChallenges.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No Active Challenges</h3>
                    <p className="text-muted-foreground mb-4">
                      Start a challenge to build better saving habits
                    </p>
                    <CreateChallengeModal onCreateChallenge={createChallenge} isCreating={isCreating} />
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence>
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeChallenges.map(challenge => (
                      <PersonalChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onUpdateProgress={(id, amount) => updateProgress({ challengeId: id, amount })}
                        onDelete={deleteChallenge}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </TabsContent>
            
            <TabsContent value="templates">
              <ChallengeTemplates onSelectTemplate={createChallenge} />
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedChallenges.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No Completed Challenges Yet</h3>
                    <p className="text-muted-foreground">
                      Complete your first challenge to see it here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {completedChallenges.map(challenge => (
                    <PersonalChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onUpdateProgress={() => {}}
                      onDelete={deleteChallenge}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
