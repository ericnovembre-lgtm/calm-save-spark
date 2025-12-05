import React, { useState } from "react";
import { useHousehold } from "@/hooks/useHousehold";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Shield, User, Send } from "lucide-react";

interface HouseholdInviteProps {
  householdId: string;
  householdName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const HouseholdInvite: React.FC<HouseholdInviteProps> = ({
  householdId,
  householdName,
  isOpen,
  onClose,
}) => {
  const { inviteMember } = useHousehold(householdId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");

  const handleInvite = async () => {
    if (!email.trim()) return;

    await inviteMember.mutateAsync({
      householdId,
      email: email.trim(),
      role,
    });

    setEmail("");
    setRole("member");
    onClose();
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Invite someone to join "{householdName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidEmail(email)) {
                  handleInvite();
                }
              }}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "member" | "admin")}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Member</div>
                      <div className="text-xs text-muted-foreground">
                        Can view and edit shared budgets
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">
                        Can manage members and settings
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!isValidEmail(email) || inviteMember.isPending}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {inviteMember.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground text-center">
            They'll receive an email invitation to join the household.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
