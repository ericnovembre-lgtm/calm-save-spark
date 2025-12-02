import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Calendar, DollarSign, Sparkles } from "lucide-react";
import { MonteCarloChart } from "@/components/digital-twin/MonteCarloChart";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SharedScenario() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    fetchScenario();
  }, [token]);

  const fetchScenario = async () => {
    try {
      // Fetch scenario data
      const { data, error: fetchError } = await supabase
        .from('shared_scenario_links')
        .select('*')
        .eq('share_token', token)
        .eq('is_public', true)
        .single();

      if (fetchError) throw fetchError;

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('This share link has expired');
      }

      setScenario(data);

      // Increment view count
      await supabase
        .from('shared_scenario_links')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);

    } catch (err: any) {
      console.error('Error fetching scenario:', err);
      setError(err.message || 'Failed to load scenario');
      toast.error(err.message || 'Failed to load scenario');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-mono">Loading scenario...</p>
        </div>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/50 border-red-500/20 backdrop-blur-xl">
          <div className="text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-white">Scenario Not Found</h2>
            <p className="text-white/60">{error || 'This scenario does not exist or is no longer available.'}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const scenarioData = scenario.scenario_data;
  const finalNetWorth = scenarioData.timeline[scenarioData.timeline.length - 1]?.netWorth || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-500" />
              <h1 className="text-2xl font-bold font-mono">◢◤ $AVE+ ◥◣</h1>
            </div>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
            >
              Create Your Own
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Scenario Header */}
          <div className="text-center space-y-4">
            {scenario.preview_image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl"
              >
                <img 
                  src={scenario.preview_image_url} 
                  alt={scenario.scenario_name}
                  className="w-full"
                />
              </motion.div>
            )}
            
            <h2 className="text-4xl font-bold font-mono text-cyan-500">
              {scenario.scenario_name}
            </h2>
            <p className="text-white/60 text-lg">
              A financial projection shared on $ave+ Digital Twin
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-cyan-500" />
                <h3 className="font-mono text-white/80">Timeline</h3>
              </div>
              <p className="text-3xl font-bold">
                {scenarioData.retirementAge - scenarioData.currentAge} years
              </p>
              <p className="text-sm text-white/40 mt-1">
                Age {scenarioData.currentAge} → {scenarioData.retirementAge}
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-green-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h3 className="font-mono text-white/80">Final Net Worth</h3>
              </div>
              <p className="text-3xl font-bold text-green-500">
                ${finalNetWorth.toLocaleString()}
              </p>
              <p className="text-sm text-white/40 mt-1">
                At retirement age
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-magenta-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-magenta-500" />
                <h3 className="font-mono text-white/80">Life Events</h3>
              </div>
              <p className="text-3xl font-bold">
                {scenarioData.events.length}
              </p>
              <p className="text-sm text-white/40 mt-1">
                Major financial milestones
              </p>
            </Card>
          </div>

          {/* Life Events */}
          {scenarioData.events.length > 0 && (
            <Card className="max-w-5xl mx-auto p-8 bg-slate-900/50 border-cyan-500/20 backdrop-blur-sm">
              <h3 className="text-2xl font-bold font-mono mb-6 text-cyan-500">
                Life Events Timeline
              </h3>
              <div className="space-y-4">
                {scenarioData.events.map((event: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-white/10"
                  >
                    <div className="text-3xl">{event.event.icon}</div>
                    <div className="flex-1">
                      <div className="font-mono text-white">{event.event.label}</div>
                      <div className="text-sm text-white/40">Age {event.year}</div>
                    </div>
                    <div className={`text-xl font-bold ${event.event.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {event.event.impact >= 0 ? '+' : ''}${Math.abs(event.event.impact).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Monte Carlo Chart */}
          {scenarioData.monteCarloData && scenarioData.monteCarloData.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <MonteCarloChart timeline={scenarioData.monteCarloData} />
              </motion.div>
            </div>
          )}

          {/* CTA Section */}
          <Card className="max-w-3xl mx-auto p-12 bg-gradient-to-br from-cyan-500/10 to-magenta-500/10 border-cyan-500/30 backdrop-blur-xl text-center">
            <Sparkles className="w-16 h-16 text-cyan-500 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Create Your Own Financial Future</h3>
            <p className="text-white/70 text-lg mb-8">
              Use $ave+ Digital Twin to visualize your own financial scenarios with life events, 
              Monte Carlo projections, and interactive timelines.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-lg px-8 py-6"
            >
              Start Free →
            </Button>
          </Card>

          {/* View Count */}
          <div className="text-center text-sm text-white/40 font-mono">
            {scenario.views_count} {scenario.views_count === 1 ? 'view' : 'views'}
          </div>
        </motion.div>
      </div>
    </div>
  );
}