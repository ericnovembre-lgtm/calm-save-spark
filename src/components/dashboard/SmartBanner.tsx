import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type BannerType = 'welcome' | 'nudge' | null;

interface BannerContent {
  type: BannerType;
  title: string;
  description: string;
  icon: any;
  color: string;
  action?: () => void;
  actionLabel?: string;
}

export function SmartBanner() {
  const [dismissed, setDismissed] = useState<BannerType[]>([]);
  const [currentBanner, setCurrentBanner] = useState<BannerContent | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Check for user activity
  const [hasRecentActivity, setHasRecentActivity] = useState(false);

  useEffect(() => {
    // Check localStorage for last visit
    const lastVisit = localStorage.getItem('last_dashboard_visit');
    const now = Date.now();
    
    if (lastVisit) {
      const hoursSinceVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
      setHasRecentActivity(hoursSinceVisit < 12);
    }
    
    // Update last visit
    localStorage.setItem('last_dashboard_visit', now.toString());
  }, []);

  const { data: nudges } = useQuery({
    queryKey: ['agent_nudges', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data } = await supabase
        .from('agent_nudges')
        .select('*')
        .eq('user_id', session.user.id)
        .is('acted_on_at', null)
        .is('dismissed_at', null)
        .order('priority', { ascending: false })
        .limit(1);
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    // Determine which banner to show based on priority
    if (dismissed.includes('welcome') && dismissed.includes('nudge')) {
      setCurrentBanner(null);
      return;
    }

    // Priority 1: AI Nudges (if any exist and not dismissed)
    if (!dismissed.includes('nudge') && nudges && nudges.length > 0) {
      const topNudge = nudges[0];
      setCurrentBanner({
        type: 'nudge',
        title: '💡 Smart Suggestion',
        description: topNudge.message,
        icon: TrendingUp,
        color: 'from-primary/20 to-accent/20',
        action: () => {
          if (topNudge.action_url) {
            window.location.href = topNudge.action_url;
          }
        },
        actionLabel: 'View'
      });
      return;
    }

    // Priority 2: Welcome Back (if returning user and not dismissed)
    if (!dismissed.includes('welcome') && !hasRecentActivity) {
      setCurrentBanner({
        type: 'welcome',
        title: '👋 Welcome Back!',
        description: 'Keep your momentum going with your savings goals',
        icon: Target,
        color: 'from-primary/20 to-blue-500/20',
      });
      return;
    }

    setCurrentBanner(null);
  }, [dismissed, nudges, hasRecentActivity]);

  const handleDismiss = async (type: BannerType) => {
    if (!type) return;
    setDismissed(prev => [...prev, type]);
    
    // Mark nudge as dismissed in database
    if (type === 'nudge' && nudges && nudges.length > 0) {
      const topNudge = nudges[0];
      await supabase
        .from('agent_nudges')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', topNudge.id);
    }
  };

  if (!currentBanner) return null;

  const Icon = currentBanner.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentBanner.type}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r ${currentBanner.color} backdrop-blur-lg p-4 mb-6`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              {currentBanner.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentBanner.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentBanner.action && (
              <Button
                size="sm"
                onClick={currentBanner.action}
                className="flex-shrink-0"
              >
                {currentBanner.actionLabel}
              </Button>
            )}
            
            <button
              onClick={() => handleDismiss(currentBanner.type)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-background/50"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
