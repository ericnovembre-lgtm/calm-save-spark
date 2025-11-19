import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Target, TrendingUp, BadgeDollarSign, Wallet as WalletIcon, CreditCard, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: Target,
    title: "Goals",
    description: "Set and track your savings goals",
    path: "/goals",
    color: "text-blue-500"
  },
  {
    icon: TrendingUp,
    title: "Investments",
    description: "Track your investment portfolio",
    path: "/investments",
    color: "text-green-500"
  },
  {
    icon: BadgeDollarSign,
    title: "Credit Score",
    description: "Monitor your credit health",
    path: "/credit",
    color: "text-purple-500"
  },
  {
    icon: WalletIcon,
    title: "Wallet",
    description: "Manage your digital wallet",
    path: "/wallet",
    color: "text-orange-500"
  },
  {
    icon: CreditCard,
    title: "Card",
    description: "Your $ave+ secured credit card",
    path: "/card",
    color: "text-indigo-500"
  },
  {
    icon: Trophy,
    title: "Achievements",
    description: "View your financial milestones",
    path: "/achievements",
    color: "text-yellow-500"
  },
];

export default function GrowWealthHub() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Grow Wealth
          </h1>
          <p className="text-muted-foreground text-lg">
            Build your future with goals, investments, and credit building
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
