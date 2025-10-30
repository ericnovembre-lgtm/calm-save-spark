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
import { Button } from "@/components/ui/button";
import { AppUser, signOut } from "@/lib/session";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserChipProps {
  user: AppUser;
}

export const UserChip = ({ user }: UserChipProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/welcome");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 h-9"
          aria-label="User menu"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-7 h-7 rounded-full bg-accent flex items-center justify-center"
          >
            <User className="w-4 h-4" />
          </motion.div>
          <span className="hidden md:inline text-sm font-medium">
            {user.full_name || user.email?.split('@')[0] || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{user.full_name || 'User'}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
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
