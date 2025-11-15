import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, TrendingUp, Award } from "lucide-react";
import { MagneticButton } from "@/components/welcome/advanced/MagneticButton";
import { TiltCard3D } from "@/components/welcome/advanced/TiltCard3D";
import { MorphingNumber } from "@/components/welcome/advanced/MorphingNumber";
import { TypewriterText } from "@/components/welcome/TypewriterText";
import { motion } from "framer-motion";
export const Hero = () => {
  return <section className="relative min-h-[90vh] flex items-center px-4 md:px-20 py-20">
      <div className="absolute inset-0 bg-background" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          {/* Left: Content */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="space-y-8">
            <h1 className="font-display font-bold text-5xl md:text-7xl xl:text-8xl text-foreground leading-tight">
              Get Rewarded For{" "}
              <span className="inline-block whitespace-nowrap min-w-[20ch]">
                <TypewriterText 
                  phrases={[
                    "Saving, Not Spending",
                    "Owning, Not Loaning",
                    "Growing, Not Owing",
                    "Wealth, Not Poverty"
                  ]}
                  className="text-accent"
                />
              </span>
              <br />
              <span className="text-accent">Stress Less</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl">
              Join 50,000+ users who save $450/month automatically with smart round-ups and AI-powered insights.
            </p>
            
            {/* 3-Step Process */}
            <div className="flex flex-wrap gap-3">
              <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: 0.2,
              duration: 0.4
            }} className="px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Connect Bank Account
              </motion.div>
              <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: 0.3,
              duration: 0.4
            }} className="px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Auto Save
              </motion.div>
              <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: 0.4,
              duration: 0.4
            }} className="px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-sm font-semibold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                Earn Rewards
              </motion.div>
            </div>
            
            {/* CTAs */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5,
            duration: 0.5
          }} className="flex flex-col sm:flex-row gap-4">
              <Link to="/onboarding" className="inline-block">
                <MagneticButton variant="default" className="group px-8 py-4 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </MagneticButton>
              </Link>
              <Link to="/pricing" className="inline-block">
                <MagneticButton variant="outline" className="px-8 py-4 text-lg">
                  View Pricing
                </MagneticButton>
              </Link>
            </motion.div>
            
            <p className="text-sm text-muted-foreground">
              ✓ Free forever plan • ✓ No credit card required • ✓ Cancel anytime
            </p>
          </motion.div>
          
          {/* Right: Interactive 3D Card */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3,
          duration: 0.6
        }}>
            <TiltCard3D>
              <div className="p-8 rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Average monthly savings</p>
                    <MorphingNumber value={450} prefix="$" suffix="/mo" className="text-5xl font-bold text-accent" duration={2.5} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                    <div className="text-center">
                      <MorphingNumber value={50000} suffix="+" className="text-2xl font-bold text-foreground" duration={2} delay={0.3} />
                      <p className="text-xs text-muted-foreground mt-1">Active users</p>
                    </div>
                    <div className="text-center">
                      <MorphingNumber value={4.25} suffix="%" decimals={2} className="text-2xl font-bold text-foreground" duration={2} delay={0.5} />
                      <p className="text-xs text-muted-foreground mt-1">Average APY</p>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </motion.div>
        </div>
      </div>
    </section>;
};