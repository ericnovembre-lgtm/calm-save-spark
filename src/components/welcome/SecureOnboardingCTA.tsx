import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, FileText, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { MagneticButton } from "@/components/welcome/advanced/MagneticButton";

const securityFeatures = [
  { icon: Shield, text: 'FDIC Insured up to $250,000', subtext: 'Your deposits are protected by federal insurance' },
  { icon: Lock, text: '256-bit Encryption', subtext: 'Bank-level security for all transactions' },
  { icon: CheckCircle, text: 'Multi-Factor Authentication', subtext: 'Additional layers of account protection' },
  { icon: FileText, text: 'SOC 2 Type II Compliant', subtext: 'Audited security and privacy controls' },
] as const;

const riskFactors = [
  'Investment and savings products are not FDIC insured beyond standard deposit insurance limits',
  'Past performance does not guarantee future results',
  'All financial products carry some level of risk including potential loss of principal',
  'Interest rates and rewards are subject to change without notice',
  'Early withdrawal from certain products may result in penalties',
  'Credit products require creditworthiness evaluation and approval',
];

export const SecureOnboardingCTA = () => {
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false);
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      await trackEvent('onboarding_cta_clicked', { source: 'welcome_page' });
      navigate(isAuthenticated ? '/onboarding' : '/onboarding');
    } catch (e) {
      console.error('Error starting onboarding:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Security Banner */}
      <section className="mb-6 overflow-hidden">
        <div className="w-full p-6 sm:p-8 bg-background border border-[color:var(--color-border)] rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="rounded-full p-3 border border-[color:var(--color-border)]">
              <Shield className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-foreground">
                FDIC Insured & Bank-Level Security
              </h4>
              <p className="text-sm text-muted-foreground">
                Your deposits are protected up to $250,000 per depositor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            {isAuthenticated ? 'Continue Your Journey' : 'Ready to Start Saving?'}
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isAuthenticated 
              ? 'Complete your setup and start building wealth today' 
              : 'Join 50,000+ savers building wealth through automated savings'}
          </p>

          <div className="pt-4 flex flex-col items-center gap-4">
            <MagneticButton
              onClick={handleGetStarted}
              disabled={loading}
              variant="default"
              className="text-lg px-10 py-6"
            >
              {loading ? 'Processing...' : 'Get Started Free'}
            </MagneticButton>
            
            {/* Inline Risk Disclosure Toggle */}
            <button
              onClick={() => setShowRiskDisclosure(!showRiskDisclosure)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              Important disclosures
              {showRiskDisclosure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {showRiskDisclosure && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full max-w-2xl"
                >
                  <div className="p-4 bg-muted/30 rounded-lg border border-border text-left">
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {riskFactors.map((risk, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-accent">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acknowledgedRisks}
                        onChange={(e) => setAcknowledgedRisks(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-xs text-foreground">I acknowledge these risks</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-sm text-muted-foreground">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {securityFeatures.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="p-4 rounded-xl border border-[color:var(--color-border)] bg-card/50 hover:bg-card/80 transition-all"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-full bg-accent/20">
                    <IconComponent className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm text-foreground">{feature.text}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{feature.subtext}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </>
  );
};
