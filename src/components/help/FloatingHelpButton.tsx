import { useState, useCallback, useRef } from 'react';
import { HelpCircle, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentChat } from '@/components/ai-agents/AgentChat';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocation } from 'react-router-dom';
import { haptics } from '@/lib/haptics';
import { NotificationBadge } from './NotificationBadge';
import { HelpWidgetStatusIndicator } from './HelpWidgetStatusIndicator';
import { HelpWidgetBackdrop } from './HelpWidgetBackdrop';
import { QuickActionsMenu } from './QuickActionsMenu';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import { useGestures } from '@/hooks/useGestures';
import { 
  floatContinuous, 
  breathe, 
  elasticSpring, 
  slideInFromRight,
  glowPulse 
} from '@/lib/motion-variants';

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'typing' | 'thinking'>('online');
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const dragControls = useDragControls();
  const { count, reset } = useNotificationBadge();
  const { handleSwipe } = useGestures();
  const panelRef = useRef<HTMLDivElement>(null);

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

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    reset();
    haptics.vibrate('medium');
  }, [reset]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    haptics.vibrate('light');
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
    haptics.vibrate('light');
  }, [isMinimized]);

  const handleLongPress = useCallback(() => {
    setShowQuickActions(true);
    haptics.vibrate('heavy');
  }, []);

  const handlePanelSwipe = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    handleSwipe(
      info,
      undefined,
      () => {
        setIsOpen(false);
        haptics.vibrate('medium');
      },
      100
    );
  }, [handleSwipe]);

  const handleHeaderSwipe = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 50) {
      setIsMinimized(true);
      haptics.vibrate('light');
    }
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { scale: 1, opacity: 1 }
                : {
                    scale: 1,
                    opacity: 1,
                    y: [0, -12, 0],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
            }
            exit={{ scale: 0, opacity: 0, rotate: 360 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
            style={{ position: 'fixed' }}
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut' as const,
                      },
                    }
              }
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: 1.1,
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.5 },
                    }
              }
              whileTap={{ scale: 0.95 }}
              onPointerDown={(e) => {
                const timeout = setTimeout(handleLongPress, 500);
                e.currentTarget.addEventListener(
                  'pointerup',
                  () => clearTimeout(timeout),
                  { once: true }
                );
              }}
              className="relative"
            >
              <Button
                size="lg"
                className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-primary/80"
                onClick={handleOpen}
                aria-label="Open Help Agent"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
                }}
              >
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          rotate: [0, 10, -10, 0],
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <HelpCircle className="w-6 h-6" />
                </motion.div>
              </Button>
              <NotificationBadge count={count} />
              
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full -z-10"
                  animate={{
                    boxShadow: [
                      '0 0 20px hsl(var(--primary) / 0.2)',
                      '0 0 30px hsl(var(--primary) / 0.4)',
                      '0 0 20px hsl(var(--primary) / 0.2)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                  }}
                  style={{
                    background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
                    filter: 'blur(10px)',
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Menu */}
      <QuickActionsMenu
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
      />

      {/* Help Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <HelpWidgetBackdrop onClick={handleClose} />
            
            <motion.div
              ref={panelRef}
              {...slideInFromRight}
              drag={!isMinimized}
              dragControls={dragControls}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.1}
              onDragEnd={handlePanelSwipe}
              className={`fixed ${
                isMinimized ? 'bottom-6' : 'bottom-0 md:bottom-6'
              } right-0 md:right-6 z-50 bg-background/95 backdrop-blur-xl border border-border/50 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden`}
              style={{
                width: isMinimized ? '320px' : '100%',
                maxWidth: isMinimized ? '320px' : '400px',
                height: isMinimized ? '60px' : '100vh',
                maxHeight: isMinimized ? '60px' : '90vh',
                willChange: 'transform',
              }}
            >
              {/* Animated Header Background */}
              <motion.div
                className="absolute inset-0 opacity-10 pointer-events-none"
                animate={{
                  background: [
                    'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                    'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)',
                    'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                  ],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Header */}
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleHeaderSwipe}
                className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Avatar Background Effect */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          'radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.3) 0%, transparent 60%)',
                          'radial-gradient(circle at 70% 70%, hsl(var(--primary) / 0.3) 0%, transparent 60%)',
                          'radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.3) 0%, transparent 60%)',
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <HelpCircle className="w-5 h-5 text-primary relative z-10" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      $ave+ Help
                      <motion.div
                        animate={
                          prefersReducedMotion
                            ? {}
                            : {
                                rotate: [0, 360],
                              }
                        }
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-primary" />
                      </motion.div>
                    </h3>
                    {!isMinimized && (
                      <HelpWidgetStatusIndicator status={agentStatus} />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMinimize}
                      aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                      className="hover:bg-primary/10"
                    >
                      <motion.div
                        animate={isMinimized ? { rotate: 180 } : { rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isMinimized ? (
                          <Maximize2 className="w-4 h-4" />
                        ) : (
                          <Minimize2 className="w-4 h-4" />
                        )}
                      </motion.div>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      aria-label="Close"
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Chat Content */}
              <AnimatePresence mode="wait">
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="h-[calc(100%-73px)]"
                  >
                    <AgentChat
                      agentType="help_agent"
                      initialContext={{
                        currentPage: getPageName(location.pathname),
                        pathname: location.pathname,
                      }}
                      placeholder="Ask me anything about $ave+..."
                      className="h-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drag Handle Indicator */}
              {!isMinimized && !prefersReducedMotion && (
                <motion.div
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/20 rounded-full"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cursor Spotlight Effect on Desktop */}
      {isOpen && !prefersReducedMotion && (
        <div className="hidden md:block">
          {/* Could add cursor spotlight here if needed */}
        </div>
      )}
    </>
  );
}
