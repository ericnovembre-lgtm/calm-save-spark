import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet, Edit2, Trash2, Calendar, Target, DollarSign, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";

const Pots = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPot, setEditingPot] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [potForm, setPotForm] = useState({
    name: "",
    target_amount: "",
    target_date: "",
    notes: "",
    color: "blue"
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    mutationFn: async (pot: typeof potForm & { user_id: string }) => {
      const { error } = await supabase
        .from('pots')
        .insert([{
          user_id: pot.user_id,
          name: pot.name,
          target_amount: pot.target_amount ? parseFloat(pot.target_amount) : null,
          target_date: pot.target_date || null,
          notes: pot.notes || null,
          color: pot.color
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      toast({ title: "Pot created successfully!" });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create pot", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updatePotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof potForm> }) => {
      const { error } = await supabase
        .from('pots')
        .update({
          name: data.name,
          target_amount: data.target_amount ? parseFloat(data.target_amount) : null,
          target_date: data.target_date || null,
          notes: data.notes || null,
          color: data.color
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      toast({ title: "Pot updated successfully!" });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update pot", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deletePotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pots'] });
      toast({ title: "Pot deleted successfully!" });
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast({ 
        title: "Failed to delete pot", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!potForm.name.trim()) {
      errors.name = "Pot name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingPot(null);
    setPotForm({ name: "", target_amount: "", target_date: "", notes: "", color: "blue" });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPotForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEdit = (pot: any) => {
    setEditingPot(pot);
    setPotForm({
      name: pot.name || "",
      target_amount: pot.target_amount ? pot.target_amount.toString() : "",
      target_date: pot.target_date || "",
      notes: pot.notes || "",
      color: pot.color || "blue"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (potId: string) => {
    deletePotMutation.mutate(potId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ title: "Please fix the form errors", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", variant: "destructive" });
      return;
    }

    if (editingPot) {
      updatePotMutation.mutate({ id: editingPot.id, data: potForm });
    } else {
      createPotMutation.mutate({ ...potForm, user_id: user.id });
    }
  };

  const calculateProgress = (current: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Savings Pots</h1>
            <p className="text-muted-foreground">Organize your savings into flexible containers</p>
          </div>
          
          <Button 
            onClick={() => {
              setEditingPot(null);
              setPotForm({ name: "", target_amount: "", target_date: "", notes: "", color: "blue" });
              setFormErrors({});
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Pot
          </Button>
        </div>

        {/* Create/Edit Pot Modal - Full Screen Overlay */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-background rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingPot ? 'Edit Pot' : 'Create a New Pot'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingPot ? 'Update your savings pot details' : 'Create a flexible savings container for any purpose'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="rounded-full"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <Label htmlFor="pot-name">
                    Pot Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pot-name"
                    name="name"
                    placeholder="e.g., Vacation Fund"
                    value={potForm.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? "border-destructive" : ""}
                    autoFocus
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="pot-target">Target Amount (Optional)</Label>
                  <Input
                    id="pot-target"
                    name="target_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 2500"
                    value={potForm.target_amount}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="pot-target-date">Target Date (Optional)</Label>
                  <Input
                    id="pot-target-date"
                    name="target_date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={potForm.target_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="pot-notes">Notes (Optional)</Label>
                  <Textarea
                    id="pot-notes"
                    name="notes"
                    rows={3}
                    placeholder="Add any notes..."
                    value={potForm.notes}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={createPotMutation.isPending || updatePotMutation.isPending}
                  >
                    {createPotMutation.isPending || updatePotMutation.isPending 
                      ? 'Saving...' 
                      : editingPot ? 'Update Pot' : 'Create Pot'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading pots...</div>
        ) : pots && pots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pots.map((pot) => {
              const progress = calculateProgress(
                parseFloat(String(pot.current_amount)),
                pot.target_amount
              );

              return (
                <Card key={pot.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 flex-1">
                        <Wallet className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{pot.name}</span>
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pot)}
                          className="h-8 w-8"
                          aria-label="Edit pot"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(pot)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label="Delete pot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {pot.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{pot.notes}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Balance:{" "}
                        <span className="font-medium">
                          ${parseFloat(String(pot.current_amount || 0)).toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </span>
                      </span>
                    </div>

                    {pot.target_amount && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Target:{" "}
                            <span className="font-medium">
                              ${parseFloat(String(pot.target_amount)).toLocaleString('en-US', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} />
                        </div>
                      </>
                    )}

                    {pot.target_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Target Date:{" "}
                          <span className="font-medium">
                            {format(new Date(pot.target_date), 'MMM d, yyyy')}
                          </span>
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="No Pots Yet"
            description="Create your first savings pot to organize your money"
            actionLabel="Create Your First Pot"
            onAction={() => {
              setEditingPot(null);
              setIsDialogOpen(true);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pot?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Pots;