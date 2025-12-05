import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  avatar_url: string | null;
  settings: Record<string, unknown>;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  invited_by: string | null;
  status: "pending" | "accepted" | "declined";
  invite_email: string | null;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export const useHousehold = (householdId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's households
  const householdsQuery = useQuery({
    queryKey: ["households", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase
        .from("households" as any)
        .select("*")
        .or(`created_by.eq.${user.id}`) as any);

      if (error) {
        console.warn("Households query failed:", error);
        return [];
      }
      return (data || []) as Household[];
    },
    enabled: !!user,
  });

  // Fetch specific household with members
  const householdQuery = useQuery({
    queryKey: ["household", householdId],
    queryFn: async () => {
      if (!householdId) return null;

      const { data, error } = await (supabase
        .from("households" as any)
        .select("*")
        .eq("id", householdId)
        .single() as any);

      if (error) throw error;
      return data as Household;
    },
    enabled: !!householdId,
  });

  // Fetch household members
  const membersQuery = useQuery({
    queryKey: ["household-members", householdId],
    queryFn: async () => {
      if (!householdId) return [];

      const { data, error } = await (supabase
        .from("household_members" as any)
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq("household_id", householdId) as any);

      if (error) {
        console.warn("Household members query failed:", error);
        return [];
      }
      return (data || []) as HouseholdMember[];
    },
    enabled: !!householdId,
  });

  // Create household
  const createHousehold = useMutation({
    mutationFn: async ({ name, avatarUrl }: { name: string; avatarUrl?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase
        .from("households" as any)
        .insert({
          name,
          created_by: user.id,
          avatar_url: avatarUrl || null,
        })
        .select()
        .single() as any);

      if (error) throw error;

      // Add creator as owner member
      await (supabase
        .from("household_members" as any)
        .insert({
          household_id: data.id,
          user_id: user.id,
          role: "owner",
          status: "accepted",
          invited_by: user.id,
        }) as any);

      return data as Household;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      toast.success("Household created");
    },
    onError: (error) => {
      toast.error("Failed to create household");
      console.error(error);
    },
  });

  // Update household
  const updateHousehold = useMutation({
    mutationFn: async ({
      id,
      name,
      avatarUrl,
      settings,
    }: {
      id: string;
      name?: string;
      avatarUrl?: string;
      settings?: Record<string, unknown>;
    }) => {
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
      if (settings !== undefined) updates.settings = settings;

      const { data, error } = await (supabase
        .from("households" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as Household;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["household", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["households"] });
      toast.success("Household updated");
    },
    onError: () => {
      toast.error("Failed to update household");
    },
  });

  // Delete household
  const deleteHousehold = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("households" as any)
        .delete()
        .eq("id", id) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      toast.success("Household deleted");
    },
    onError: () => {
      toast.error("Failed to delete household");
    },
  });

  // Invite member
  const inviteMember = useMutation({
    mutationFn: async ({
      householdId: hId,
      email,
      role = "member",
    }: {
      householdId: string;
      email: string;
      role?: "admin" | "member";
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Call edge function to handle invite
      const { data, error } = await supabase.functions.invoke("household-invite", {
        body: {
          householdId: hId,
          email,
          role,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members", householdId] });
      toast.success("Invitation sent");
    },
    onError: (error) => {
      toast.error("Failed to send invitation");
      console.error(error);
    },
  });

  // Update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "admin" | "member";
    }) => {
      const { data, error } = await (supabase
        .from("household_members" as any)
        .update({ role })
        .eq("id", memberId)
        .select()
        .single() as any);

      if (error) throw error;
      return data as HouseholdMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members", householdId] });
      toast.success("Member role updated");
    },
    onError: () => {
      toast.error("Failed to update member role");
    },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await (supabase
        .from("household_members" as any)
        .delete()
        .eq("id", memberId) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members", householdId] });
      toast.success("Member removed");
    },
    onError: () => {
      toast.error("Failed to remove member");
    },
  });

  // Accept/decline invitation
  const respondToInvite = useMutation({
    mutationFn: async ({
      memberId,
      accept,
    }: {
      memberId: string;
      accept: boolean;
    }) => {
      const { data, error } = await (supabase
        .from("household_members" as any)
        .update({
          status: accept ? "accepted" : "declined",
          joined_at: accept ? new Date().toISOString() : null,
        })
        .eq("id", memberId)
        .select()
        .single() as any);

      if (error) throw error;
      return data as HouseholdMember;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      queryClient.invalidateQueries({ queryKey: ["pending-household-invites"] });
      toast.success(variables.accept ? "Invitation accepted" : "Invitation declined");
    },
    onError: () => {
      toast.error("Failed to respond to invitation");
    },
  });

  // Get pending invites for current user
  const pendingInvitesQuery = useQuery({
    queryKey: ["pending-household-invites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase
        .from("household_members" as any)
        .select(`
          *,
          household:household_id (
            name,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "pending") as any);

      if (error) {
        console.warn("Pending invites query failed:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  return {
    // Data
    households: householdsQuery.data || [],
    household: householdQuery.data,
    members: membersQuery.data || [],
    pendingInvites: pendingInvitesQuery.data || [],

    // Loading states
    isLoadingHouseholds: householdsQuery.isLoading,
    isLoadingHousehold: householdQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,

    // Mutations
    createHousehold,
    updateHousehold,
    deleteHousehold,
    inviteMember,
    updateMemberRole,
    removeMember,
    respondToInvite,

    // Current user info
    currentUserId: user?.id,
  };
};
