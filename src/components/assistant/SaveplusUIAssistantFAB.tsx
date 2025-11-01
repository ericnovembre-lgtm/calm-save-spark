import { useState } from 'react';
import { MessageSquare, X, Bot, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickLink {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const quickLinks: QuickLink[] = [
  {
    label: 'Chat with Coach',
    path: '/coach',
    icon: '💬',
    description: 'Get AI-powered financial advice',
  },
  {
    label: 'Help Center',
    path: '/help',
    icon: '❓',
    description: 'Find answers to common questions',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: '⚙️',
    description: 'Manage your account preferences',
  },
];

/**
 * SaveplusUIAssistantFAB - Floating action button for quick access to help
 * Provides quick navigation to Coach, Help, and Settings
 */
export function SaveplusUIAssistantFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Quick Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="Quick Help"
              className="fixed bottom-20 right-4 w-80 rounded-xl shadow-2xl z-50 
                         bg-background border-2 border-border overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold">Quick Help</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Links */}
              <div className="p-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavigate(link.path)}
                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-accent 
                               transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {link.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-0.5">
                          {link.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {link.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 bg-muted/30 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Need more help? Visit our{' '}
                  <button
                    onClick={() => handleNavigate('/help')}
                    className="underline hover:text-foreground"
                  >
                    Help Center
                  </button>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full z-50 shadow-lg
                   bg-primary text-primary-foreground
                   hover:shadow-xl transition-shadow
                   flex items-center justify-center"
        aria-label="Open assistant"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </motion.button>
    </>
  );
}
