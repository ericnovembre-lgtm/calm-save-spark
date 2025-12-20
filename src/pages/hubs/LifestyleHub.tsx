import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LifestyleBackground } from "@/components/hubs/lifestyle/LifestyleBackground";
import { LifestyleBentoCard } from "@/components/hubs/lifestyle/LifestyleBentoCard";
import { LifestyleGradientHeader } from "@/components/hubs/lifestyle/LifestyleGradientHeader";
import {
  FamilyIcon,
  StudentIcon,
  BusinessIcon,
  LiteracyIcon,
  SustainabilityIcon,
  HealthIcon,
  DigitalTwinIcon,
  WishlistIcon,
  CouplesIcon,
  DiaryIcon,
  MilestonesIcon,
  MindsetIcon,
  CommunityIcon,
} from "@/components/hubs/lifestyle/LifestyleAnimatedIcons";

// Features with strategic sizing for bento layout - reordered for visual balance
const features = [
  // Row 1: Lead with Financial Health (large anchor)
  {
    icon: <HealthIcon size="lg" />,
    title: "Financial Health",
    description: "Overall financial wellness score and personalized insights",
    path: "/financial-health",
    size: "lg" as const,
  },
  {
    icon: <FamilyIcon />,
    title: "Family",
    description: "Family savings and allowances",
    path: "/family",
    size: "sm" as const,
  },
  {
    icon: <StudentIcon />,
    title: "Student",
    description: "Student budgeting and loans",
    path: "/student",
    size: "sm" as const,
  },
  // Row 2: Small cards for visual breathing room
  {
    icon: <BusinessIcon />,
    title: "Business OS",
    description: "Freelancer financial management",
    path: "/business-os",
    size: "sm" as const,
  },
  {
    icon: <LiteracyIcon />,
    title: "Financial Literacy",
    description: "Learn about personal finance",
    path: "/literacy",
    size: "sm" as const,
  },
  {
    icon: <SustainabilityIcon />,
    title: "Sustainability",
    description: "Track carbon footprint",
    path: "/sustainability",
    size: "sm" as const,
  },
  {
    icon: <DigitalTwinIcon />,
    title: "Digital Twin",
    description: "Plan and simulate major life events",
    path: "/digital-twin",
    size: "sm" as const,
  },
  // Row 3: Couples as second large anchor (offset position)
  {
    icon: <CouplesIcon size="lg" />,
    title: "Couples",
    description: "Manage finances together with your partner seamlessly",
    path: "/couples",
    size: "lg" as const,
  },
  {
    icon: <WishlistIcon />,
    title: "Wishlist Tracker",
    description: "Save for items you want",
    path: "/wishlist",
    size: "sm" as const,
  },
  // Row 4: Remaining small cards
  {
    icon: <DiaryIcon />,
    title: "Financial Diary",
    description: "Journal your financial thoughts and moods",
    path: "/financial-diary",
    size: "sm" as const,
  },
  {
    icon: <MilestonesIcon />,
    title: "Milestones Timeline",
    description: "View your financial journey achievements",
    path: "/milestones-timeline",
    size: "sm" as const,
  },
  {
    icon: <MindsetIcon />,
    title: "Money Mindset",
    description: "Track your relationship with money",
    path: "/money-mindset",
    size: "sm" as const,
  },
  // Row 5: Community Forum spanning width
  {
    icon: <CommunityIcon />,
    title: "Community Forum",
    description: "Connect with others on their financial journey",
    path: "/community-forum",
    size: "wide" as const,
  },
];

// Container variants for staggered entrance - refined timing
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,  // Faster cascade
      delayChildren: 0.15,    // Quicker start
    },
  },
};

export default function LifestyleHub() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <AppLayout>
      {/* Atmospheric background */}
      <LifestyleBackground />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Gradient header */}
        <LifestyleGradientHeader />

        {/* Bento grid with staggered entrance */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <LifestyleBentoCard
              key={feature.path}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              path={feature.path}
              size={feature.size}
              index={index}
            />
          ))}
        </motion.div>

        {/* Keyboard navigation hint with attention animation */}
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            className="relative px-4 py-2 rounded-full bg-card/60 backdrop-blur-lg border border-border/20 text-muted-foreground text-xs flex items-center gap-2"
            animate={prefersReducedMotion ? {} : {
              boxShadow: [
                '0 0 0px hsl(var(--accent) / 0)',
                '0 0 20px hsl(var(--accent) / 0.3)',
                '0 0 0px hsl(var(--accent) / 0)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: 3,
              delay: 2,
              ease: 'easeInOut',
            }}
          >
            <motion.kbd 
              className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[10px]"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: 3,
                delay: 2.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Tab
            </motion.kbd>
            <span>to navigate</span>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
