import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Sparkles, Building2, Users, TrendingUp, Gamepad2, CalendarClock, RefreshCw, Coins, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sparkles,
    title: "Alternatives Portal",
    description: "Alternative investments access",
    path: "/alternatives-portal",
    color: "text-purple-500",
    premium: true
  },
  {
    icon: Building2,
    title: "Family Office",
    description: "High-net-worth financial management",
    path: "/family-office",
    color: "text-blue-500",
    premium: true
  },
  {
    icon: Users,
    title: "Corporate Wellness",
    description: "Employee financial wellness programs",
    path: "/corporate-wellness",
    color: "text-green-500",
    premium: true
  },
  {
    icon: TrendingUp,
    title: "Investment Manager",
    description: "Advanced portfolio management",
    path: "/investments?tab=tax-optimization",
    color: "text-indigo-500"
  },
  {
    icon: Gamepad2,
    title: "LifeSim",
    description: "Simulate future financial scenarios",
    path: "/lifesim",
    color: "text-pink-500"
  },
  {
    icon: CalendarClock,
    title: "Digital Twin",
    description: "Long-term financial planning",
    path: "/digital-twin",
    color: "text-orange-500"
  },
  {
    icon: RefreshCw,
    title: "Refinancing Hub",
    description: "Debt refinancing opportunities",
    path: "/refinancing-hub",
    color: "text-teal-500"
  },
  {
    icon: Coins,
    title: "DeFi Manager",
    description: "Decentralized finance management",
    path: "/defi-manager",
    color: "text-yellow-500"
  },
  {
    icon: FileText,
    title: "Tax Documents",
    description: "Tax preparation and filing",
    path: "/tax-documents",
    color: "text-red-500"
  },
];

export default function PremiumHub() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary" />
            Premium Features
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced tools and solutions for sophisticated financial needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={feature.path}>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full border-2 hover:border-primary relative">
                  {feature.premium && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500">
                      Premium
                    </Badge>
                  )}
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
