import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

const routeNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  "manage-money": "Manage Money",
  "grow-wealth": "Grow Wealth",
  "ai-insights": "AI & Insights",
  lifestyle: "Lifestyle",
  premium: "Premium",
  hubs: "Features",
  budget: "Budget",
  transactions: "Transactions",
  subscriptions: "Subscriptions",
  debts: "Debts",
  pots: "Pots",
  automations: "Automations",
  "bill-negotiation": "Bill Negotiation",
  accounts: "Accounts",
  goals: "Goals",
  investments: "Investments",
  credit: "Credit Score",
  wallet: "Wallet",
  card: "Card",
  achievements: "Achievements",
  coach: "AI Coach",
  "ai-agents": "AI Agents",
  "digital-twin": "Digital Twin",
  "agent-hub": "Agent Hub",
  insights: "Insights",
  analytics: "Analytics",
  guardian: "Guardian",
  family: "Family",
  student: "Student",
  business: "Business",
  "business-os": "Business OS",
  literacy: "Financial Literacy",
  sustainability: "Sustainability",
  "financial-health": "Financial Health",
  "life-planner": "Life Planner",
  settings: "Settings",
  help: "Help",
  // Admin routes
  sitemap: "Sitemap",
  "page-analytics": "Page Analytics",
  admin: "Admin",
  "admin-monitoring": "Admin Monitoring",
  "security-monitoring": "Security Monitoring",
  "claude-monitoring": "Claude Monitoring",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Admin routes that should always show breadcrumbs even if single-level
  const adminRoutes = ['sitemap', 'page-analytics', 'admin', 'admin-monitoring', 'security-monitoring', 'claude-monitoring'];
  const isAdminRoute = pathnames.length === 1 && adminRoutes.includes(pathnames[0]);

  // Don't show breadcrumbs on dashboard or regular single-level routes (but DO show for admin)
  if (pathnames.length <= 1 && !isAdminRoute) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link
            to="/dashboard"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNameMap[name] || name;

          return (
            <motion.li
              key={routeTo}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="hover:text-foreground transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
};
