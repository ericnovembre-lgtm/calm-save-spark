import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
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

// Features with strategic sizing for bento layout
const features = [
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
  {
    icon: <CouplesIcon size="lg" />,
    title: "Couples",
    description: "Manage finances together with your partner seamlessly",
    path: "/couples",
    size: "lg" as const,
  },
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
  {
    icon: <WishlistIcon />,
    title: "Wishlist Tracker",
    description: "Save for items you want",
    path: "/wishlist",
    size: "sm" as const,
  },
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
  {
    icon: <CommunityIcon />,
    title: "Community Forum",
    description: "Connect with others on their financial journey",
    path: "/community-forum",
    size: "wide" as const,
  },
];

// Container variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

export default function LifestyleHub() {
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

        {/* Keyboard navigation hint */}
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-lg border border-white/10 text-muted-foreground text-xs flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[10px]">Tab</kbd>
            <span>to navigate</span>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
