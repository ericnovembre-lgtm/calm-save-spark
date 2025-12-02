import { motion } from 'framer-motion';
import { BarChart3, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DigitalTwinAnalyticsDashboard } from '@/components/digital-twin/DigitalTwinAnalyticsDashboard';
import '@/styles/digital-twin-theme.css';

export default function DigitalTwinAnalytics() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#050505]">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/digital-twin')}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-500" />
                  <h1 className="text-2xl font-bold text-white">Digital Twin Analytics</h1>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  Track your simulation history, model usage, and generated insights
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-white/40 font-mono">ANALYTICS ENGINE</span>
            </div>
          </motion.div>

          {/* Dashboard */}
          <DigitalTwinAnalyticsDashboard />
        </div>
      </div>
    </AppLayout>
  );
}
