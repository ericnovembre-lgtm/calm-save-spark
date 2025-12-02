import { X, ChevronRight, Target, Wallet, TrendingUp, Zap, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NavItem } from "./NavItem";
import { AppUser } from "@/lib/session";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ name: string; path: string; icon?: any }>;
  user: AppUser | null;
}

export const MobileDrawer = ({ isOpen, onClose, navLinks, user }: MobileDrawerProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("main");

  // Group navigation links
  const mainLinks = navLinks.slice(0, 6);
  const quickLinks = navLinks.slice(6, 10);
  const settingsLinks = navLinks.slice(10);

  const sections = [
    { id: "main", title: "Main", links: mainLinks },
    { id: "quick", title: "Quick Access", links: quickLinks },
    { id: "settings", title: "Settings", links: settingsLinks },
  ];

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
            className="fixed left-0 top-0 bottom-0 w-80 glass-bg-strong backdrop-blur-xl border-r border-accent/20 z-50 lg:hidden overflow-y-auto"
          >
            {/* Premium Header with gradient */}
            <div className="relative">
              <div className="h-0.5 bg-gradient-accent" />
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="hover:bg-accent/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="p-4 border-b border-border">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 border-accent/20 hover:bg-accent/10"
                >
                  <Target className="w-4 h-4" />
                  New Goal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 border-accent/20 hover:bg-accent/10"
                >
                  <Zap className="w-4 h-4" />
                  Quick Add
                </Button>
              </div>
            </div>

            {/* Enhanced Profile Card */}
            {user && (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-lg font-bold shadow-glass"
                  >
                    {user.full_name?.[0] || user.email?.[0] || 'U'}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Savings Progress</span>
                    <span className="font-medium text-accent">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-muted-foreground">🔥 15 day streak</span>
                    <span className="text-success font-medium">+$450 saved</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grouped Navigation with Collapsible Sections */}
            <nav className="p-4 space-y-4" role="navigation" aria-label="Main navigation">
              {sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  {/* Section Header */}
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    {section.title}
                    <motion.div
                      animate={{ rotate: expandedSection === section.id ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </button>

                  {/* Section Links */}
                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1 overflow-hidden"
                      >
                        {section.links.map((link) => (
                          <NavItem
                            key={link.path}
                            name={link.name}
                            path={link.path}
                            icon={link.icon}
                            onClick={onClose}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
