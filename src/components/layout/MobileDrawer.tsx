import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NavItem } from "./NavItem";
import { AppUser } from "@/lib/session";
import { Progress } from "@/components/ui/progress";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ name: string; path: string; icon?: any }>;
  user: AppUser | null;
}

export const MobileDrawer = ({ isOpen, onClose, navLinks, user }: MobileDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-background border-r border-border z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Profile Card */}
            {user && (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg font-bold">
                    {user.full_name?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="p-4 space-y-1" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavItem
                  key={link.path}
                  name={link.name}
                  path={link.path}
                  icon={link.icon}
                  onClick={onClose}
                />
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
