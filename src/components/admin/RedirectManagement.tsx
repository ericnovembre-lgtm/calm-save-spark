import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, TrendingUp, Save, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CustomRedirect {
  id: string;
  from_path: string;
  to_path: string;
  description: string | null;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export function RedirectManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    from_path: '',
    to_path: '',
    description: '',
    is_active: true,
  });

  // Fetch redirects
  const { data: redirects, isLoading } = useQuery({
    queryKey: ['custom-redirects'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('custom_redirects')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data as CustomRedirect[];
    },
  });

  // Create/Update redirect
  const saveMutation = useMutation({
    mutationFn: async (redirect: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingId) {
        const { error } = await (supabase.from as any)('custom_redirects')
          .update(redirect)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from as any)('custom_redirects')
          .insert({ ...redirect, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-redirects'] });
      toast.success(editingId ? 'Redirect updated' : 'Redirect created');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save redirect');
    },
  });

  // Delete redirect
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)('custom_redirects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-redirects'] });
      toast.success('Redirect deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete redirect');
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await (supabase.from as any)('custom_redirects')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-redirects'] });
    },
  });

  const resetForm = () => {
    setFormData({
      from_path: '',
      to_path: '',
      description: '',
      is_active: true,
    });
    setEditingId(null);
  };

  const handleEdit = (redirect: CustomRedirect) => {
    setFormData({
      from_path: redirect.from_path,
      to_path: redirect.to_path,
      description: redirect.description || '',
      is_active: redirect.is_active,
    });
    setEditingId(redirect.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate paths
    if (!formData.from_path.startsWith('/')) {
      toast.error('From path must start with /');
      return;
    }
    if (!formData.to_path.startsWith('/')) {
      toast.error('To path must start with /');
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Custom Redirects
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage custom URL redirects for common 404 errors
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Redirect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Redirect' : 'Create New Redirect'}
              </DialogTitle>
              <DialogDescription>
                Set up a custom redirect from one URL path to another.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from_path">From Path</Label>
                <Input
                  id="from_path"
                  placeholder="/old-page"
                  value={formData.from_path}
                  onChange={(e) =>
                    setFormData({ ...formData, from_path: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The URL path that should be redirected (e.g., /old-page)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_path">To Path</Label>
                <Input
                  id="to_path"
                  placeholder="/new-page"
                  value={formData.to_path}
                  onChange={(e) =>
                    setFormData({ ...formData, to_path: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The destination URL path (e.g., /new-page)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Why this redirect exists..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading redirects...
          </div>
        ) : redirects && redirects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Path</TableHead>
                <TableHead>To Path</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Usage
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-sm">
                    {redirect.from_path}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {redirect.to_path}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {redirect.description || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-xs font-medium">
                      {redirect.usage_count}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={redirect.is_active}
                      onCheckedChange={(checked) =>
                        toggleActiveMutation.mutate({
                          id: redirect.id,
                          isActive: checked,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(redirect)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this redirect?'
                            )
                          ) {
                            deleteMutation.mutate(redirect.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">No redirects configured yet.</p>
            <p className="text-sm">
              Create redirects to automatically redirect common 404 errors.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
