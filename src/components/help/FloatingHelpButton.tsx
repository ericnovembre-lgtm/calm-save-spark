import { useState } from 'react';
import { HelpCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentChat } from '@/components/ai-agents/AgentChat';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocation } from 'react-router-dom';

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();

  // Map route to page name for context
  const getPageName = (pathname: string) => {
    const pageMap: Record<string, string> = {
      '/': 'Landing Page',
      '/dashboard': 'Dashboard',
      '/goals': 'Goals',
      '/budget': 'Budget',
      '/transactions': 'Transactions',
      '/analytics': 'Analytics',
      '/settings': 'Settings',
      '/ai-agents': 'AI Hub',
      '/savings-hub': 'Savings Hub',
      '/budget-hub': 'Budget Hub',
      '/analytics-hub': 'Analytics Hub',
      '/premium-hub': 'Premium Hub',
      '/coach': 'Financial Coach',
      '/help': 'Help Center',
      '/automations': 'Automations',
      '/pots': 'Smart Pots',
      '/investments': 'Investments',
      '/crypto': 'Crypto',
      '/cards': 'Cards',
      '/rewards': 'Rewards',
      '/insights': 'Insights',
      '/reports': 'Reports',
      '/forecasts': 'Forecasts',
      '/security': 'Security',
      '/privacy': 'Privacy',
      '/notifications': 'Notifications',
      '/profile': 'Profile',
      '/subscription': 'Subscription',
      '/billing': 'Billing',
      '/integrations': 'Integrations',
      '/api': 'API Access',
      '/teams': 'Teams',
      '/organization': 'Organization',
      '/developer': 'Developer',
    };
    return pageMap[pathname] || pathname;
  };

  return (
    <>
      {/* Floating Help Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => setIsOpen(true)}
              aria-label="Open Help Agent"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed ${
              isMinimized ? 'bottom-6' : 'bottom-0'
            } right-6 z-50 bg-background border border-border rounded-lg shadow-2xl overflow-hidden`}
            style={{
              width: isMinimized ? '320px' : '400px',
              height: isMinimized ? '60px' : '600px',
              maxHeight: '90vh',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">$ave+ Help</h3>
                  <p className="text-xs text-muted-foreground">
                    Ask me anything
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <div className="h-[calc(100%-73px)]">
                <AgentChat
                  agentType="help_agent"
                  initialContext={{
                    currentPage: getPageName(location.pathname),
                    pathname: location.pathname,
                  }}
                  placeholder="Ask me anything about $ave+..."
                  className="h-full"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
