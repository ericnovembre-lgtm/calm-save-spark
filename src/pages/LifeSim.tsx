import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameBoard } from '@/components/lifesim/GameBoard';
import { DecisionCard } from '@/components/lifesim/DecisionCard';
import { StatsPanel } from '@/components/lifesim/StatsPanel';
import { SessionHistory } from '@/components/lifesim/SessionHistory';
import { NewGameDialog } from '@/components/lifesim/NewGameDialog';
import { toast } from 'sonner';
import { Loader2, Play, Trophy } from 'lucide-react';

export default function LifeSim() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: activeSessions, isLoading } = useQuery({
    queryKey: ['lifesim-game-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lifesim_game_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const activeSession = activeSessions?.find(s => s.id === activeSessionId);

  const createSession = useMutation({
    mutationFn: async (params: { sessionName: string; startingAge: number; targetAge: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('lifesim_game_sessions')
        .insert({
          user_id: user.id,
          session_name: params.sessionName,
          starting_age: params.startingAge,
          target_age: params.targetAge,
          current_age: params.startingAge,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lifesim-game-sessions'] });
      setActiveSessionId(data.id);
      toast.success('New simulation started!');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LifeSim Financial Simulator</h1>
          <p className="text-muted-foreground mt-2">
            SimCity for personal finance - learn by living a simulated financial life
          </p>
        </div>
        <NewGameDialog onCreateGame={createSession.mutate} />
      </div>

      {!activeSession ? (
        <Card className="p-12 text-center space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Start Your Financial Journey</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Experience life from graduation to retirement. Make complex financial choices and learn
            about compound interest, taxes, and risk through visceral gameplay.
          </p>
          <NewGameDialog onCreateGame={createSession.mutate}>
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Start New Simulation
            </Button>
          </NewGameDialog>
        </Card>
      ) : (
        <Tabs defaultValue="game" className="space-y-6">
          <TabsList>
            <TabsTrigger value="game">Game Board</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="history">Session History</TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{activeSession.session_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Age {activeSession.current_age} / {activeSession.target_age}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Financial State</p>
                  <p className="text-2xl font-bold">
                    ${((activeSession.financial_state as any)?.net_worth || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <Progress 
                value={(activeSession.current_age - activeSession.starting_age) / (activeSession.target_age - activeSession.starting_age) * 100}
                className="h-2"
              />
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <GameBoard session={activeSession} />
              </div>
              <div>
                <DecisionCard session={activeSession} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <StatsPanel sessionId={activeSession?.id || ''} />
          </TabsContent>

          <TabsContent value="history">
            <SessionHistory 
              sessions={activeSessions || []} 
              onSelectSession={setActiveSessionId}
              currentSessionId={activeSessionId}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
