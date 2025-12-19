import { User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppUser, signOut } from "@/lib/session";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserChipProps {
  user: AppUser;
}

// Premium user chip with savings streak and glassmorphic dropdown
export const UserChip = ({ user }: UserChipProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 h-9"
          aria-label="User menu"
        >
          <motion.div whileHover={{ scale: 1.05 }}>
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || 'User'} />
              <AvatarFallback className="text-xs">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <span className="hidden md:inline text-sm font-medium">
            {user.full_name || user.email?.split('@')[0] || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 glass-bg-strong backdrop-blur-xl border-accent/20 shadow-glass-elevated">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{user.full_name || 'User'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">Pro</span>
            </div>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Savings Streak */}
        <div className="px-2 py-3 mb-2">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">🔥 Savings Streak</span>
            <span className="font-bold text-accent">15 days</span>
          </div>
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  i < 5 ? "bg-accent" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
