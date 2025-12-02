import { motion } from 'framer-motion';
import { Sparkles, UserCircle, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Empty state shown when user hasn't set up their Digital Twin profile
 */
export function ProfileRequiredPrompt() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <motion.div
        className="max-w-2xl w-full backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Icon */}
        <motion.div
          className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 border-2 border-cyan-500/30 flex items-center justify-center mb-8"
          animate={{
            boxShadow: [
              '0 0 20px rgba(0,255,255,0.3)',
              '0 0 40px rgba(255,0,255,0.3)',
              '0 0 20px rgba(0,255,255,0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-12 h-12 text-cyan-500" />
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          ◢◤ Initialize Your Digital Twin ◥◣
        </h1>
        <p className="text-white/60 text-lg mb-8 font-mono">
          Create a living simulation of your financial future
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20"
            whileHover={{ scale: 1.05 }}
          >
            <UserCircle className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-2">Personal Profile</h3>
            <p className="text-xs text-white/60">
              Age, income, expenses, and life stage
            </p>
          </motion.div>

          <motion.div
            className="p-4 rounded-xl bg-magenta-500/5 border border-magenta-500/20"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="w-8 h-8 text-magenta-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-2">Financial Projection</h3>
            <p className="text-xs text-white/60">
              Simulate your net worth over decades
            </p>
          </motion.div>

          <motion.div
            className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20"
            whileHover={{ scale: 1.05 }}
          >
            <Target className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-2">Life Events</h3>
            <p className="text-xs text-white/60">
              Test scenarios like job changes or major purchases
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white font-semibold"
            onClick={() => navigate('/settings')}
          >
            Set Up Your Twin Profile
          </Button>
          <p className="text-xs text-white/40 font-mono">
            Takes 2 minutes · Fully private and secure
          </p>
        </div>
      </motion.div>
    </div>
  );
}
