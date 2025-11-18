import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Share2, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareBudgetDialogProps {
  budgetId: string;
  budgetName: string;
}

type PermissionLevel = "view" | "edit" | "admin";

export const ShareBudgetDialog = ({ budgetId, budgetName }: ShareBudgetDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<PermissionLevel>("view");
  const queryClient = useQueryClient();

  const { data: shares, isLoading } = useQuery({
    queryKey: ["budget-shares", budgetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_shares")
        .select(`
          *,
          profiles:shared_with_user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("budget_id", budgetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const shareMutation = useMutation({
    mutationFn: async ({ email, permission }: { email: string; permission: PermissionLevel }) => {
      // First, find user by email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        throw new Error("User not found with that email address");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("budget_shares").insert({
        budget_id: budgetId,
        shared_with_user_id: userData.id,
        permission_level: permission,
        invited_by: session.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Budget shared successfully!");
      setEmail("");
      setPermission("view");
      queryClient.invalidateQueries({ queryKey: ["budget-shares", budgetId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to share budget");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from("budget_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access removed");
      queryClient.invalidateQueries({ queryKey: ["budget-shares", budgetId] });
    },
    onError: () => {
      toast.error("Failed to remove access");
    },
  });

  const handleShare = () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    shareMutation.mutate({ email, permission });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{budgetName}"</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this budget
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite Form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleShare()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permission">Access level</Label>
              <Select value={permission} onValueChange={(v) => setPermission(v as PermissionLevel)}>
                <SelectTrigger id="permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">View only</span>
                      <span className="text-xs text-muted-foreground">Can view budget data</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Can edit</span>
                      <span className="text-xs text-muted-foreground">Can modify budget</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Admin</span>
                      <span className="text-xs text-muted-foreground">Can manage sharing</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleShare}
              disabled={shareMutation.isPending}
              className="w-full"
            >
              {shareMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send invite"
              )}
            </Button>
          </div>

          {/* Existing Shares */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : shares && shares.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">People with access</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map((share: any) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {share.profiles?.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {share.profiles?.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {share.permission_level}
                          {share.status === "pending" && " • Pending"}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(share.id)}
                      disabled={removeMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collaborators yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
