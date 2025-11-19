import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Wallet, PieChart, DollarSign, Receipt, CreditCard, Coins, Zap, BadgeDollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: PieChart,
    title: "Budget",
    description: "Track spending across categories",
    path: "/budget",
    color: "text-blue-500"
  },
  {
    icon: DollarSign,
    title: "Transactions",
    description: "View all your transactions",
    path: "/transactions",
    color: "text-green-500"
  },
  {
    icon: Receipt,
    title: "Subscriptions",
    description: "Manage recurring payments",
    path: "/subscriptions",
    color: "text-purple-500"
  },
  {
    icon: CreditCard,
    title: "Debts",
    description: "Track and pay off debts",
    path: "/debts",
    color: "text-red-500"
  },
  {
    icon: Coins,
    title: "Pots",
    description: "Organize savings in pots",
    path: "/pots",
    color: "text-yellow-500"
  },
  {
    icon: Zap,
    title: "Automations",
    description: "Set up automated savings rules",
    path: "/automations",
    color: "text-orange-500"
  },
  {
    icon: BadgeDollarSign,
    title: "Bill Negotiation",
    description: "Save money on recurring bills",
    path: "/bill-negotiation",
    color: "text-indigo-500"
  },
  {
    icon: Wallet,
    title: "Accounts",
    description: "Connect and manage accounts",
    path: "/accounts",
    color: "text-teal-500"
  },
];

export default function ManageMoneyHub() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-primary" />
            Manage Money
          </h1>
          <p className="text-muted-foreground text-lg">
            Track spending, manage budgets, and automate your savings
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
