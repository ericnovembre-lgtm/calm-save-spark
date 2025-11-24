import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { EnhancedInvestments } from "@/components/investments/EnhancedInvestments";
import { LoadingState } from "@/components/LoadingState";
import { EmotionDetectionBar } from "@/components/guardian/EmotionDetectionBar";
import { InterventionModal } from "@/components/guardian/InterventionModal";
import { motion } from "framer-motion";

export default function Investments() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [interventionData, setInterventionData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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
    <div className="min-h-screen bg-slate-950">
      <AppLayout>
        {/* Terminal Grid Background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

      <div className="relative z-10 space-y-6">
        {/* Live Connection Indicator */}
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 border border-green-500/30 rounded-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              </span>
              <span className="text-sm font-mono font-bold text-green-400 tracking-wider">LIVE</span>
            </div>
            <span className="text-sm font-mono text-slate-400">
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

        <div>
          <h1 className="text-3xl font-mono font-bold text-slate-100 mb-2">
            Investment Command Center
          </h1>
          <p className="text-slate-400 text-sm font-mono">
            Real-time portfolio analytics · Market intelligence · Risk assessment
          </p>
        </div>

        <EnhancedInvestments userId={userId} />
      </div>
    </AppLayout>
    </div>
  );
}
