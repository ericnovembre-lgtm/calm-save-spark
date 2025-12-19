import { motion } from "framer-motion";
import { User, Calendar, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/hooks/useProfile";
import { format } from "date-fns";

interface ProfileHeaderProps {
  profile: UserProfile;
  email?: string;
  onEditClick?: () => void;
}

export const ProfileHeader = ({ profile, email, onEditClick }: ProfileHeaderProps) => {
  const memberSince = profile.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy")
    : "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
    >
      {/* Large Avatar */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Avatar className="h-24 w-24 ring-4 ring-accent/20">
          <AvatarImage
            src={profile.avatar_url || undefined}
            alt={profile.full_name || "User"}
          />
          <AvatarFallback className="text-2xl bg-accent/10 text-accent">
            <User className="w-10 h-10" />
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* Name & Email */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {profile.full_name || "User"}
        </h1>
        <p className="text-sm text-muted-foreground">{email || profile.email}</p>
      </div>

      {/* Member Since Badge */}
      <Badge variant="secondary" className="flex items-center gap-1.5">
        <Calendar className="w-3 h-3" />
        Member since {memberSince}
      </Badge>

      {/* Edit Button */}
      {onEditClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="mt-2"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      )}
    </motion.div>
  );
};
