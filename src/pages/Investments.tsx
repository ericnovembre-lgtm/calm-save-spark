import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { EnhancedInvestments } from "@/components/investments/EnhancedInvestments";
import { LoadingState } from "@/components/LoadingState";
import { EmotionDetectionBar } from "@/components/guardian/EmotionDetectionBar";
import { InterventionModal } from "@/components/guardian/InterventionModal";
import { motion } from "framer-motion";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

export default function Investments() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [interventionData, setInterventionData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isDemoMode, disableDemoMode } = useDemoMode();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();

    const checkCoolingOff = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: activeSession } = await supabase
        .from('cooling_off_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('early_exit_requested', null)
        .gt('end_time', new Date().toISOString())
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSession) {
        navigate('/cooling-off');
      }
    };

    checkCoolingOff();

    // Update last updated time every 30 seconds
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!userId) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background">
      <AppLayout>
        {/* Subtle Grid Background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-30"
          style={{
            backgroundImage: 
              'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

      <div className="relative z-10 space-y-6">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <motion.div 
            className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="alert"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Demo Mode Active</p>
                <p className="text-sm text-muted-foreground">Viewing sample portfolio data for demonstration purposes</p>
              </div>
            </div>
            <Button 
              onClick={disableDemoMode} 
              variant="ghost" 
              size="sm"
              className="hover:bg-warning/20"
            >
              <X className="w-4 h-4 mr-1" />
              Exit Demo
            </Button>
          </motion.div>
        )}

        {/* Live Connection Indicator */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-card border border-success/20 rounded-lg shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success shadow-[0_0_8px_hsl(var(--success)/0.4)]"></span>
              </span>
              <span className="text-sm font-mono font-bold text-success tracking-wider">LIVE</span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>

        <EmotionDetectionBar />

        <InterventionModal
          open={!!interventionData}
          onOpenChange={(open) => !open && setInterventionData(null)}
          emotion={interventionData?.emotion || ''}
          confidence={interventionData?.confidence || 0}
          arguments={interventionData?.arguments || []}
          onPause={() => {
            navigate('/cooling-off');
            setInterventionData(null);
          }}
          onContinue={() => {
            setInterventionData(null);
          }}
        />

        <div className="mb-2">
          <h1 className="text-3xl font-mono font-bold text-foreground mb-2">
            Investment Command Center
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time portfolio analytics · Market intelligence · Risk assessment
          </p>
        </div>

        <EnhancedInvestments userId={userId} />
      </div>
    </AppLayout>
    </div>
  );
}
