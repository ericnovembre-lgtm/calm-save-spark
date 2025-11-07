import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, FileText, AlertTriangle, ChevronRight, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

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
    if (!acknowledgedRisks) {
      setShowRiskDisclosure(true);
      return;
    }
    
    setLoading(true);
    try {
      await trackEvent('onboarding_cta_clicked', { source: 'welcome_page' });
      
      if (isAuthenticated) {
        navigate('/onboarding');
      } else {
        // Store return path and redirect to onboarding
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_redirect', '/onboarding');
        }
        navigate('/onboarding');
      }
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
        <button
          onClick={() => setShowRiskDisclosure(true)}
          className="w-full p-6 sm:p-8 text-left hover:opacity-95 transition-opacity group
                     bg-[hsl(var(--background))] border border-[hsl(var(--border))]
                     rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-3 border border-[hsl(var(--border))]">
                <Shield className="w-8 h-8 text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[hsl(var(--foreground))]">
                  FDIC Insured & Bank-Level Security
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your deposits are protected up to $250,000 per depositor
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </button>
      </section>

      {/* Main CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.35 }}
        className="p-6 sm:p-10 rounded-xl border border-[hsl(var(--border))]
                   bg-[hsl(var(--accent))]/40 backdrop-blur-sm"
      >
        <div className="text-center mb-8">
          <h3 className="mb-4 font-display font-bold text-2xl sm:text-3xl text-[hsl(var(--foreground))]">
            Ready to Start Your <span className="text-[color:var(--color-accent)] animate-subtle-glow">Savings Journey</span>?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of users who have already transformed their financial lives with $ave+.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {securityFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="rounded-lg p-4 border border-[hsl(var(--border))]
                         bg-[hsl(var(--background))]"
            >
              <div className="flex items-start space-x-3">
                <feature.icon className="w-5 h-5 text-[hsl(var(--foreground))] mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm text-[hsl(var(--foreground))]">{feature.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">{feature.subtext}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Risk Acknowledgment */}
        <div className="rounded-lg mb-6 p-4 border border-[hsl(var(--border))]
                        bg-[hsl(var(--accent))]/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--foreground))] mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="flex items-start space-x-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedRisks}
                  onChange={(e) => setAcknowledgedRisks(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-foreground"
                  aria-label="Acknowledge risk factors"
                />
                <span className="text-[hsl(var(--foreground))]">
                  I acknowledge that I have read and understand the{' '}
                  <button
                    type="button"
                    onClick={() => setShowRiskDisclosure(true)}
                    className="underline hover:text-muted-foreground transition-colors"
                  >
                    risk factors and terms
                  </button>{' '}
                  associated with financial services.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Main CTA Button */}
        <Button
          onClick={handleGetStarted}
          disabled={loading || !acknowledgedRisks}
          variant="primary"
          size="lg"
          animated
          className="w-full text-lg h-14 bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/90 text-foreground font-semibold"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[hsl(var(--primary-foreground))] border-t-transparent" />
              <span>Getting Started...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Start Building Wealth Today</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Account opening subject to identity verification and eligibility requirements.
        </p>
      </motion.section>

      {/* Risk Disclosure Modal */}
      {showRiskDisclosure && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Important Risk Disclosures"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRiskDisclosure(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-xl border
                       bg-[hsl(var(--background))] border-[hsl(var(--border))]
                       shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
                Important Risk Disclosures
              </h3>
              <button
                onClick={() => setShowRiskDisclosure(false)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <h4 className="font-semibold mb-2 text-[hsl(var(--foreground))]">FDIC Insurance Coverage</h4>
                <p className="text-sm text-muted-foreground">
                  Deposits held at our partner banks are insured by the FDIC up to $250,000 per depositor,
                  per insured bank, per ownership category. This insurance covers deposit accounts only and
                  does not cover investment products or losses due to market fluctuations.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <h4 className="font-semibold mb-2 text-[hsl(var(--foreground))]">General Risk Factors</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {riskFactors.map((risk, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-[hsl(var(--foreground))] shrink-0">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-[hsl(var(--border))]
                              bg-[hsl(var(--accent))]/40">
                <h4 className="font-semibold mb-2 text-[hsl(var(--foreground))]">Regulatory Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  $ave+ operates in partnership with FDIC-insured banks and is committed to maintaining
                  the highest standards of financial compliance, including adherence to BSA/AML requirements,
                  consumer protection regulations, and data security standards.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowRiskDisclosure(false);
                  setAcknowledgedRisks(true);
                }}
                variant="primary"
                size="lg"
                className="flex-1 bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/90 text-foreground font-semibold"
              >
                I Understand & Accept
              </Button>
              <Button
                onClick={() => setShowRiskDisclosure(false)}
                variant="neutral"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
