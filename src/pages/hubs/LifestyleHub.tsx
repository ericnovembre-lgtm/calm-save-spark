import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { UsersRound, GraduationCap, BookOpen, Leaf, Heart, Briefcase, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: UsersRound,
    title: "Family",
    description: "Family savings and allowances",
    path: "/family",
    color: "text-blue-500"
  },
  {
    icon: GraduationCap,
    title: "Student",
    description: "Student budgeting and loans",
    path: "/student",
    color: "text-purple-500"
  },
  {
    icon: Briefcase,
    title: "Business OS",
    description: "Freelancer financial management",
    path: "/business-os",
    color: "text-indigo-500"
  },
  {
    icon: BookOpen,
    title: "Financial Literacy",
    description: "Learn about personal finance",
    path: "/literacy",
    color: "text-orange-500"
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Track carbon footprint",
    path: "/sustainability",
    color: "text-green-600"
  },
  {
    icon: Heart,
    title: "Financial Health",
    description: "Overall financial wellness score",
    path: "/financial-health",
    color: "text-red-500"
  },
  {
    icon: MapPin,
    title: "Digital Twin",
    description: "Plan and simulate major life events",
    path: "/digital-twin",
    color: "text-pink-500"
  },
];

export default function LifestyleHub() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Heart className="w-10 h-10 text-primary" />
            Lifestyle
          </h1>
          <p className="text-muted-foreground text-lg">
            Financial tools tailored to your life stage and goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={feature.path}>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full border-2 hover:border-primary">
                  <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
