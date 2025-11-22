import { useState } from "react";
import { Shield, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAutomations } from "@/hooks/useAutomations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function EmergencyBrake() {
  const { automations } = useAutomations();
  const [isToggling, setIsToggling] = useState(false);
  const queryClient = useQueryClient();

  const activeCount = automations?.filter(a => a.is_active).length || 0;
  const totalCount = automations?.length || 0;
  const allPaused = activeCount === 0 && totalCount > 0;

  const handleToggleAll = async () => {
    if (!automations || isToggling) return;

    setIsToggling(true);
    const newState = !allPaused;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Batch update all automations
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: newState })
        .eq('user_id', user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['automations'] });
      
      toast.success(
        newState 
          ? `✅ ${totalCount} automations resumed`
          : `⏸️ ${totalCount} automations paused`
      );
    } catch (error) {
      console.error('Toggle all error:', error);
      toast.error('Failed to toggle automations');
    } finally {
      setIsToggling(false);
    }
  };

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl glass-panel border-2 border-border/50">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-sm">Emergency Control</h3>
          <p className="text-xs text-muted-foreground">
            {allPaused ? 'All automations are paused' : `${activeCount} of ${totalCount} active`}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggleAll}
        disabled={isToggling}
        className={`safety-brake-button ${allPaused ? '' : 'engaged'}`}
      >
        <Power className="w-4 h-4" />
        {allPaused ? 'Resume All' : 'Pause All'}
      </button>
    </div>
  );
}
