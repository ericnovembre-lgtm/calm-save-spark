import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHousehold, Household, HouseholdMember } from "@/hooks/useHousehold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Plus,
  MoreVertical,
  Crown,
  Shield,
  User,
  Trash2,
  Edit,
  UserPlus,
  Settings,
  Check,
  X,
} from "lucide-react";
import { HouseholdInvite } from "./HouseholdInvite";

interface HouseholdManagerProps {
  className?: string;
}

export const HouseholdManager: React.FC<HouseholdManagerProps> = ({ className }) => {
  const {
    households,
    pendingInvites,
    isLoadingHouseholds,
    createHousehold,
    deleteHousehold,
    respondToInvite,
    currentUserId,
  } = useHousehold();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return;

    await createHousehold.mutateAsync({ name: newHouseholdName });
    setNewHouseholdName("");
    setIsCreateOpen(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-amber-500" />;
      case "admin":
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className={className}>
      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card className="mb-4 border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-amber-500" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvites.map((invite: any) => (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={invite.household?.avatar_url} />
                    <AvatarFallback>
                      {invite.household?.name?.[0]?.toUpperCase() || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{invite.household?.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-600"
                    onClick={() => respondToInvite.mutate({ memberId: invite.id, accept: true })}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                    onClick={() => respondToInvite.mutate({ memberId: invite.id, accept: false })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Households</h3>
          <Badge variant="secondary" className="text-xs">
            {households.length}
          </Badge>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Household</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="household-name">Household Name</Label>
                <Input
                  id="household-name"
                  placeholder="e.g., Smith Family"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateHousehold();
                  }}
                />
              </div>
              <Button
                onClick={handleCreateHousehold}
                disabled={!newHouseholdName.trim() || createHousehold.isPending}
                className="w-full"
              >
                {createHousehold.isPending ? "Creating..." : "Create Household"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Households List */}
      <div className="space-y-2">
        {isLoadingHouseholds ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : households.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No households yet. Create one to share budgets with family or roommates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {households.map((household) => (
              <HouseholdCard
                key={household.id}
                household={household}
                isOwner={household.created_by === currentUserId}
                onSelect={() => setSelectedHousehold(household)}
                onDelete={() => deleteHousehold.mutate(household.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Household Detail Dialog */}
      {selectedHousehold && (
        <HouseholdDetailDialog
          household={selectedHousehold}
          isOpen={!!selectedHousehold}
          onClose={() => setSelectedHousehold(null)}
        />
      )}
    </div>
  );
};

interface HouseholdCardProps {
  household: Household;
  isOwner: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const HouseholdCard: React.FC<HouseholdCardProps> = ({
  household,
  isOwner,
  onSelect,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onSelect}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={household.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {household.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{household.name}</span>
                {isOwner && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Crown className="h-3 w-3" />
                    Owner
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Created {new Date(household.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface HouseholdDetailDialogProps {
  household: Household;
  isOpen: boolean;
  onClose: () => void;
}

const HouseholdDetailDialog: React.FC<HouseholdDetailDialogProps> = ({
  household,
  isOpen,
  onClose,
}) => {
  const {
    members,
    isLoadingMembers,
    updateHousehold,
    updateMemberRole,
    removeMember,
    currentUserId,
  } = useHousehold(household.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(household.name);
  const [showInvite, setShowInvite] = useState(false);

  const isOwner = household.created_by === currentUserId;
  const currentMember = members.find((m) => m.user_id === currentUserId);
  const canManage = isOwner || currentMember?.role === "admin";

  const handleSaveName = async () => {
    if (!editName.trim() || editName === household.name) {
      setIsEditing(false);
      return;
    }

    await updateHousehold.mutateAsync({ id: household.id, name: editName });
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-amber-500" />;
      case "admin":
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={household.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {household.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
                className="h-8"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span>{household.name}</span>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Members Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Members</h4>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1"
                  onClick={() => setShowInvite(true)}
                >
                  <UserPlus className="h-3 w-3" />
                  Invite
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-accent/30"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.user?.full_name?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">
                            {member.user?.full_name || member.invite_email || "Unknown"}
                          </span>
                          {member.status === "pending" && (
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </div>
                    </div>

                    {canManage && member.user_id !== currentUserId && member.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role === "member" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateMemberRole.mutate({ memberId: member.id, role: "admin" })
                              }
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {member.role === "admin" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateMemberRole.mutate({ memberId: member.id, role: "member" })
                              }
                            >
                              <User className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => removeMember.mutate(member.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Invite Dialog */}
        {showInvite && (
          <HouseholdInvite
            householdId={household.id}
            householdName={household.name}
            isOpen={showInvite}
            onClose={() => setShowInvite(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
