import { AppLayout } from "@/components/layout/AppLayout";
import { PremiumBackground } from "@/components/hubs/premium/PremiumBackground";
import { PremiumBentoCard } from "@/components/hubs/premium/PremiumBentoCard";
import { 
  AlternativesIcon, FamilyOfficeIcon, CorporateWellnessIcon, 
  InvestmentIcon, LifeSimIcon, DigitalTwinIcon,
  RefinancingIcon, DeFiIcon, TaxDocumentsIcon, ReferralIcon 
} from "@/components/hubs/premium/PremiumAnimatedIcons";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const features = [
  {
    icon: <FamilyOfficeIcon className="w-12 h-12" />,
    title: "Family Office",
    description: "Comprehensive wealth management for high-net-worth families with multi-generational planning",
    path: "/family-office",
    size: "lg" as const,
    isPremium: true
  },
  {
    icon: <AlternativesIcon className="w-10 h-10" />,
    title: "Alternatives Portal",
    description: "Access exclusive alternative investments including private equity and real assets",
    path: "/alternatives-portal",
    size: "md" as const,
    isPremium: true
  },
  {
    icon: <LifeSimIcon className="w-10 h-10" />,
    title: "LifeSim",
    description: "Simulate life decisions and see their long-term financial impact",
    path: "/lifesim",
    size: "md" as const,
  },
  {
    icon: <CorporateWellnessIcon className="w-10 h-10" />,
    title: "Corporate Wellness",
    description: "Employee financial wellness programs",
    path: "/corporate-wellness",
    size: "sm" as const,
    isPremium: true
  },
  {
    icon: <InvestmentIcon className="w-10 h-10" />,
    title: "Investment Manager",
    description: "Advanced portfolio management tools",
    path: "/investments?tab=tax-optimization",
    size: "sm" as const,
  },
  {
    icon: <DigitalTwinIcon className="w-10 h-10" />,
    title: "Digital Twin",
    description: "Your AI financial mirror for long-term planning and scenario modeling",
    path: "/digital-twin",
    size: "wide" as const,
  },
  {
    icon: <RefinancingIcon className="w-10 h-10" />,
    title: "Refinancing Hub",
    description: "Find better rates for your debts",
    path: "/refinancing-hub",
    size: "sm" as const,
  },
  {
    icon: <DeFiIcon className="w-10 h-10" />,
    title: "DeFi Manager",
    description: "Decentralized finance management",
    path: "/defi-manager",
    size: "sm" as const,
  },
  {
    icon: <TaxDocumentsIcon className="w-10 h-10" />,
    title: "Tax Documents",
    description: "Tax preparation and filing assistance",
    path: "/tax-documents",
    size: "sm" as const,
  },
  {
    icon: <ReferralIcon className="w-10 h-10" />,
    title: "Referral Center",
    description: "Invite friends and earn rewards",
    path: "/referral-center",
    size: "sm" as const,
  },
];

export default function PremiumHub() {
  return (
    <AppLayout>
      <PremiumBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header */}
        <motion.div 
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Premium Features
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Advanced tools and solutions for sophisticated financial needs
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {features.map((feature, index) => (
            <PremiumBentoCard
              key={feature.path}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              path={feature.path}
              size={feature.size}
              index={index}
              isPremium={feature.isPremium}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}