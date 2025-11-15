import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { SectionCard } from "@/components/features-hub/SectionCard";
import { FeatureModal } from "@/components/features-hub/FeatureModal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { 
  TrendingUp, Shield, Zap, Target, Brain, Sparkles,
  Globe, AlertTriangle, Bot, Wallet, Gamepad2,
  BarChart3, RefreshCw, Coins, Building2,
  MapPin, FileText, Calculator, Scale, Vault
} from "lucide-react";

export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string;
  status: "available" | "coming-soon" | "beta";
  route?: string;
}

export interface Section {
  id: number;
  title: string;
  subtitle: string;
  category: "existing" | "next-gen";
  features: Feature[];
}

const sections: Section[] = [
  // Section 1: $ave+ Features (existing)
  {
    id: 1,
    title: "$ave+ Features",
    subtitle: "Core savings and financial management tools",
    category: "existing",
    features: [
      {
        id: "smart-roundups",
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Smart Round-Ups",
        description: "Automatically round up purchases and save the spare change",
        details: "Link your accounts and automatically save the difference by rounding up every purchase to the nearest dollar. Watch your savings grow effortlessly with micro-savings that add up over time.",
        status: "available",
        route: "/automations"
      },
      {
        id: "ai-insights",
        icon: <Brain className="w-6 h-6" />,
        title: "AI Insights",
        description: "Get personalized financial advice powered by advanced AI",
        details: "Our AI agents analyze your spending patterns, income, and goals to provide actionable recommendations tailored to your unique financial situation.",
        status: "available",
        route: "/coach"
      },
      {
        id: "goal-tracking",
        icon: <Target className="w-6 h-6" />,
        title: "Goal Tracking",
        description: "Set and achieve savings goals with visual progress tracking",
        details: "Create multiple savings goals with custom targets, deadlines, and visual representations. Track progress with beautiful charts and receive milestone celebrations.",
        status: "available",
        route: "/goals"
      },
      {
        id: "bank-security",
        icon: <Shield className="w-6 h-6" />,
        title: "Bank-Level Security",
        description: "Your data is protected with 256-bit encryption",
        details: "We use the same encryption standards as major banks, plus multi-factor authentication, biometric security, and continuous security monitoring.",
        status: "available"
      },
      {
        id: "instant-transfers",
        icon: <Zap className="w-6 h-6" />,
        title: "Instant Transfers",
        description: "Move money between accounts instantly",
        details: "Transfer funds between your pots, goals, and connected accounts with real-time balance updates and instant confirmation.",
        status: "available"
      },
      {
        id: "rewards",
        icon: <Sparkles className="w-6 h-6" />,
        title: "Rewards Program",
        description: "Earn points for consistent saving habits",
        details: "Build streaks, complete challenges, and unlock exclusive rewards as you develop better financial habits.",
        status: "available",
        route: "/achievements"
      }
    ]
  },
  
  // Section 2: $ave+ Services (existing)
  {
    id: 2,
    title: "$ave+ Services",
    subtitle: "Extended financial services and tools",
    category: "existing",
    features: [
      {
        id: "budget-planning",
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Budget Planning",
        description: "Create and manage comprehensive budgets",
        details: "Set up category-based budgets, track spending against targets, and receive alerts when you're approaching limits.",
        status: "available",
        route: "/budget"
      },
      {
        id: "debt-management",
        icon: <RefreshCw className="w-6 h-6" />,
        title: "Debt Management",
        description: "Track and optimize debt payoff strategies",
        details: "Visualize all your debts, compare payoff methods (snowball vs avalanche), and get personalized recommendations to become debt-free faster.",
        status: "available",
        route: "/debts"
      },
      {
        id: "investment-tracking",
        icon: <Coins className="w-6 h-6" />,
        title: "Investment Tracking",
        description: "Monitor your investment portfolio performance",
        details: "Connect brokerage accounts, track portfolio allocation, view performance metrics, and get AI-powered investment insights.",
        status: "available",
        route: "/investments"
      },
      {
        id: "credit-monitoring",
        icon: <Shield className="w-6 h-6" />,
        title: "Credit Monitoring",
        description: "Track your credit score and history",
        details: "Monitor your credit score, view detailed credit reports, understand factors affecting your score, and receive alerts on changes.",
        status: "available",
        route: "/credit"
      },
      {
        id: "bill-negotiation",
        icon: <Building2 className="w-6 h-6" />,
        title: "Bill Negotiation",
        description: "Automatically find savings on recurring bills",
        details: "Our AI scans your bills and negotiates with providers to lower your rates on internet, phone, insurance, and more.",
        status: "available",
        route: "/bill-negotiation"
      },
      {
        id: "family-banking",
        icon: <Building2 className="w-6 h-6" />,
        title: "Family Banking",
        description: "Manage family finances together",
        details: "Create family groups, share budgets, manage allowances for children, and teach financial literacy to the next generation.",
        status: "available",
        route: "/family"
      }
    ]
  },
  
  // Section 3: $ave+ Solutions (existing)
  {
    id: 3,
    title: "$ave+ Solutions",
    subtitle: "Comprehensive financial life solutions",
    category: "existing",
    features: [
      {
        id: "financial-health",
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Financial Health Score",
        description: "360° view of your financial wellbeing",
        details: "Get a comprehensive health score based on savings, debt, investments, and spending habits. Receive personalized recommendations to improve each area.",
        status: "available",
        route: "/financial-health"
      },
      {
        id: "student-solutions",
        icon: <Brain className="w-6 h-6" />,
        title: "Student Solutions",
        description: "Financial tools designed for students",
        details: "Manage student loans, create budgets on limited income, find scholarships, and build credit responsibly.",
        status: "available",
        route: "/student"
      },
      {
        id: "business-tools",
        icon: <Building2 className="w-6 h-6" />,
        title: "Business Tools",
        description: "Financial management for small businesses",
        details: "Track business expenses, manage invoices, separate personal and business finances, and prepare for tax season.",
        status: "available",
        route: "/business"
      },
      {
        id: "sustainability",
        icon: <Sparkles className="w-6 h-6" />,
        title: "Sustainability Tracking",
        description: "Align finances with environmental values",
        details: "Track the carbon footprint of your spending, discover sustainable investment options, and offset your impact.",
        status: "available",
        route: "/sustainability"
      },
      {
        id: "social-features",
        icon: <Building2 className="w-6 h-6" />,
        title: "Social & Community",
        description: "Connect with others on similar financial journeys",
        details: "Join challenges, share achievements, compare progress anonymously, and learn from the community.",
        status: "available",
        route: "/social"
      },
      {
        id: "analytics",
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Advanced Analytics",
        description: "Deep insights into your financial patterns",
        details: "Access detailed reports, trend analysis, forecasting, and custom dashboards to understand your financial story.",
        status: "available",
        route: "/analytics"
      }
    ]
  },
  
  // Section 4: Next-Gen Agentic Features (NEW)
  {
    id: 4,
    title: "Next-Gen Agentic Features",
    subtitle: "AI-powered autonomous financial agents",
    category: "next-gen",
    features: [
      {
        id: "pfdt",
        icon: <Globe className="w-6 h-6" />,
        title: "Personal Financial Digital Twin",
        description: "Dynamic simulation engine for your entire financial life",
        details: "Run 'what-if' scenarios to visualize the long-term impact of major decisions like buying a home, changing careers, or retiring early. Uses Monte Carlo simulations to gauge probability of success for your goals.",
        status: "beta",
        route: "/digital-twin"
      },
      {
        id: "behavioral-guardian",
        icon: <AlertTriangle className="w-6 h-6" />,
        title: "Behavioral Finance Guardian",
        description: "Emotional circuit-breaker during high-risk decisions",
        details: "Detects patterns of FOMO and FUD using sentiment analysis. Provides data-driven counter-arguments and enforces user-defined cooling-off periods to prevent wealth-destroying emotional decisions.",
        status: "beta",
        route: "/guardian"
      },
      {
        id: "agent-hub",
        icon: <Bot className="w-6 h-6" />,
        title: "Autonomous Agent Delegation Hub",
        description: "Central control for your team of AI financial agents",
        details: "Review goals validated by your Digital Twin and grant specific permissions to autonomous AI agents to execute tasks on your behalf with pre-authorized constraints.",
        status: "beta",
        route: "/agent-hub"
      },
      {
        id: "wallet",
        icon: <Wallet className="w-6 h-6" />,
        title: "Embedded Self-Custodial Wallet",
        description: "Secure multi-chain digital wallet built into the app",
        details: "Whitelabeled wallet infrastructure for managing on-chain assets. Acts as the vessel for autonomous agents to perform secure blockchain transactions on your behalf.",
        status: "beta",
        route: "/wallet"
      },
      {
        id: "lifesim",
        icon: <Gamepad2 className="w-6 h-6" />,
        title: "LifeSim Financial Simulator",
        description: "SimCity for personal finance - learn by living",
        details: "Live a simulated life from graduation to retirement, making complex financial choices to viscerally learn about compound interest, taxes, and risk. Your game behavior refines your Digital Twin profile.",
        status: "beta",
        route: "/lifesim"
      }
    ]
  },
  
  // Section 5: Next-Gen Autonomous Services (NEW)
  {
    id: 5,
    title: "Next-Gen Autonomous Services",
    subtitle: "AI agents working 24/7 on your behalf",
    category: "next-gen",
    features: [
      {
        id: "investment-manager",
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Autonomous Investment Manager",
        description: "24/7 portfolio optimization and tax-loss harvesting",
        details: "Executes your investment mandate with continuous tax-loss harvesting and automatic rebalancing based on goals defined in your Digital Twin. Maximizes returns while minimizing tax burden.",
        status: "beta",
        route: "/investment-manager"
      },
      {
        id: "liability-agent",
        icon: <RefreshCw className="w-6 h-6" />,
        title: "Proactive Liability Agent",
        description: "Automatically refinances loans at optimal times",
        details: "Monitors markets and your financial profile to proactively initiate and execute end-to-end refinancing for mortgages, student loans, and auto loans when net-positive opportunities arise.",
        status: "beta",
        route: "/refinancing-hub"
      },
      {
        id: "defi-manager",
        icon: <Coins className="w-6 h-6" />,
        title: "Autonomous DeFi & RWA Manager",
        description: "Optimizes yields across decentralized finance protocols",
        details: "Uses embedded wallet to execute automated yield farming across audited protocols and manage tokenized Real-World Assets like U.S. Treasuries and fractionalized real estate.",
        status: "beta",
        route: "/defi-manager"
      },
      {
        id: "alternatives-portal",
        icon: <Building2 className="w-6 h-6" />,
        title: "Democratized Alternatives Portal",
        description: "Access to private equity, credit, and tokenized assets",
        details: "Provides access to traditionally exclusive alternative investments like private equity, private credit, and tokenized art through integrated partner platforms.",
        status: "coming-soon"
      }
    ]
  },
  
  // Section 6: Next-Gen Packaged Solutions (NEW)
  {
    id: 6,
    title: "Next-Gen Packaged Solutions",
    subtitle: "Comprehensive life-event financial orchestration",
    category: "next-gen",
    features: [
      {
        id: "faale",
        icon: <MapPin className="w-6 h-6" />,
        title: "Finance as a Life Event Orchestrator",
        description: "Automated playbooks for major life milestones",
        details: "End-to-end automation of financial, administrative, and legal tasks for marriage, home purchase, or having a child. Handles everything from updating beneficiaries to opening 529 plans.",
        status: "beta",
        route: "/life-events"
      },
      {
        id: "business-of-one",
        icon: <FileText className="w-6 h-6" />,
        title: "Business-of-One OS",
        description: "Complete financial solution for creators & freelancers",
        details: "Automated S-Corp setup, bookkeeping, multi-state quarterly tax projection and payment, plus irregular income smoothing with synthetic paychecks.",
        status: "beta",
        route: "/business-os"
      },
      {
        id: "family-office",
        icon: <Vault className="w-6 h-6" />,
        title: "Mass-Affluent Digital Family Office",
        description: "Democratized estate and legacy planning",
        details: "Automated document creation (wills, trusts), proactive legacy agent monitoring life events, and secure digital inheritance vault for all financial and digital assets.",
        status: "coming-soon"
      }
    ]
  }
];

export default function FeaturesHub() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            $ave+ Features Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive suite of financial tools, from core savings features 
            to next-generation AI-powered autonomous agents
          </p>
        </motion.div>

        {/* Sections Grid */}
        <div className="space-y-16">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <SectionCard
                section={section}
                onFeatureClick={setSelectedFeature}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </AppLayout>
  );
}
