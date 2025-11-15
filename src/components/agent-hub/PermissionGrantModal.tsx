import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PermissionGrantModalProps {
  agent: any;
  delegation?: any;
  open: boolean;
  onClose: () => void;
}

export function PermissionGrantModal({ agent, delegation, open, onClose }: PermissionGrantModalProps) {
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    delegation?.granted_permissions || {}
  );

  const saveDelegation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('agent_delegations').upsert({
        id: delegation?.id,
        user_id: user.id,
        agent_id: agent.id,
        granted_permissions: permissions,
        status: Object.values(permissions).some(Boolean) ? 'active' : 'inactive',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-delegations'] });
      toast.success('Agent permissions updated');
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent.agent_name} Permissions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {agent.required_permissions?.map((perm: string) => (
            <div key={perm} className="flex items-center gap-2">
              <Checkbox
                checked={permissions[perm]}
                onCheckedChange={(checked) =>
                  setPermissions({ ...permissions, [perm]: !!checked })
                }
              />
              <span className="text-sm capitalize">{perm.replace('_', ' ')}</span>
            </div>
          ))}
          <Button onClick={() => saveDelegation.mutate()} className="w-full">
            Save Permissions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
