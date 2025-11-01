import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

const Pots = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPot, setNewPot] = useState({
    name: "",
    target_amount: "",
    color: "blue"
  });

  const { data: pots, isLoading } = useQuery({
    queryKey: ['pots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pots')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createPotMutation = useMutation({
    mutationFn: async (pot: typeof newPot) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('pots')
        .insert([{
          user_id: user.id,
          name: pot.name,
          target_amount: parseFloat(pot.target_amount),
          color: pot.color
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      toast({ title: "Pot created successfully!" });
      setIsDialogOpen(false);
      setNewPot({ name: "", target_amount: "", color: "blue" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create pot", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreatePot = () => {
    if (!newPot.name || !newPot.target_amount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createPotMutation.mutate(newPot);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Savings Pots</h1>
            <p className="text-muted-foreground">Organize your savings into flexible containers</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Pot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Pot</DialogTitle>
                <DialogDescription>
                  Create a flexible savings container for any purpose
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pot-name">Pot Name</Label>
                  <Input
                    id="pot-name"
                    placeholder="Vacation Fund"
                    value={newPot.name}
                    onChange={(e) => setNewPot({ ...newPot, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="pot-target">Target Amount ($)</Label>
                  <Input
                    id="pot-target"
                    type="number"
                    placeholder="2000"
                    value={newPot.target_amount}
                    onChange={(e) => setNewPot({ ...newPot, target_amount: e.target.value })}
                  />
                </div>
                
                <Button 
                  onClick={handleCreatePot} 
                  className="w-full"
                  disabled={createPotMutation.isPending}
                >
                  Create Pot
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading pots...</div>
        ) : pots && pots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pots.map((pot) => {
              const progress = pot.target_amount > 0 
                ? (parseFloat(String(pot.current_amount)) / parseFloat(String(pot.target_amount))) * 100 
                : 0;

              return (
                <Card key={pot.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      {pot.name}
                    </CardTitle>
                    <CardDescription>
                      ${parseFloat(String(pot.current_amount)).toLocaleString()} of ${parseFloat(String(pot.target_amount)).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={Math.min(progress, 100)} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {Number(progress.toFixed(1))}% complete
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Pots Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first savings pot to organize your money
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Pot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Pots;