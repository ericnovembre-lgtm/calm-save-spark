import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { EnhancedInvestments } from "@/components/investments/EnhancedInvestments";
import { LoadingState } from "@/components/LoadingState";
import { EmotionDetectionBar } from "@/components/guardian/EmotionDetectionBar";
import { InterventionModal } from "@/components/guardian/InterventionModal";

export default function Investments() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [interventionData, setInterventionData] = useState<any>(null);

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
  }, [navigate]);

  if (!userId) return <LoadingState />;

  return (
    <AppLayout>
      <div className="space-y-6">
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
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Investment Portfolio
          </h1>
          <p className="text-muted-foreground">
            Real-time wealth command center with market context
          </p>
        </div>

        <EnhancedInvestments userId={userId} />
      </div>
    </AppLayout>
  );
}
