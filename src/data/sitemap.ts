/**
 * Sitemap Data - Complete page structure for $ave+
 * Auto-generated from App.tsx routes with descriptions
 */

export type PageCategory = 
  | 'public' 
  | 'hub' 
  | 'manage-money' 
  | 'grow-wealth' 
  | 'ai-insights' 
  | 'lifestyle' 
  | 'premium' 
  | 'admin' 
  | 'utility';

export interface SitemapPage {
  route: string;
  title: string;
  description: string;
  category: PageCategory;
  icon: string;
  protected: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

export const SITEMAP_PAGES: SitemapPage[] = [
  // =====================
  // PUBLIC PAGES (5)
  // =====================
  { route: '/', title: 'Landing', description: 'Welcome page for unauthenticated users', category: 'public', icon: 'Home', protected: false },
  { route: '/auth', title: 'Authentication', description: 'Login and signup portal', category: 'public', icon: 'LogIn', protected: false },
  { route: '/pricing', title: 'Pricing', description: 'Subscription plans and features', category: 'public', icon: 'CreditCard', protected: false },
  { route: '/install', title: 'Install App', description: 'PWA installation guide', category: 'public', icon: 'Download', protected: false },
  { route: '/shared/:token', title: 'Shared Scenario', description: 'View shared financial scenarios', category: 'public', icon: 'Share2', protected: false },

  // =====================
  // HUB PAGES (5)
  // =====================
  { route: '/hubs/manage-money', title: 'Manage Money Hub', description: 'Budget, bills, and daily finances', category: 'hub', icon: 'Wallet', protected: true },
  { route: '/hubs/grow-wealth', title: 'Grow Wealth Hub', description: 'Investments, savings, and wealth building', category: 'hub', icon: 'TrendingUp', protected: true },
  { route: '/hubs/ai-insights', title: 'AI Insights Hub', description: 'AI coaching, digital twin, and analytics', category: 'hub', icon: 'Brain', protected: true },
  { route: '/hubs/lifestyle', title: 'Lifestyle Hub', description: 'Family, student, and lifestyle features', category: 'hub', icon: 'Heart', protected: true },
  { route: '/hubs/premium', title: 'Premium Hub', description: 'Premium and enterprise features', category: 'hub', icon: 'Crown', protected: true },

  // =====================
  // MANAGE MONEY (12)
  // =====================
  { route: '/dashboard', title: 'Dashboard', description: 'Financial overview and quick actions', category: 'manage-money', icon: 'LayoutDashboard', protected: true },
  { route: '/accounts', title: 'Accounts', description: 'Connected bank accounts', category: 'manage-money', icon: 'Building', protected: true },
  { route: '/transactions', title: 'Transactions', description: 'Transaction history and categorization', category: 'manage-money', icon: 'ArrowLeftRight', protected: true },
  { route: '/budget', title: 'Budget', description: 'Budget planning and tracking', category: 'manage-money', icon: 'PieChart', protected: true },
  { route: '/subscriptions', title: 'Subscriptions', description: 'Recurring bills and subscriptions', category: 'manage-money', icon: 'RefreshCw', protected: true },
  { route: '/debts', title: 'Debts', description: 'Debt tracking and payoff planning', category: 'manage-money', icon: 'AlertCircle', protected: true },
  { route: '/bill-negotiation', title: 'Bill Negotiation', description: 'AI-powered bill reduction', category: 'manage-money', icon: 'MessageSquare', protected: true },
  { route: '/automations', title: 'Automations', description: 'Automated savings rules', category: 'manage-money', icon: 'Zap', protected: true },
  { route: '/pots', title: 'Pots', description: 'Savings pots and jars', category: 'manage-money', icon: 'Coins', protected: true },
  { route: '/goals', title: 'Goals', description: 'Financial goals tracking', category: 'manage-money', icon: 'Target', protected: true },
  { route: '/financial-health', title: 'Financial Health', description: 'Overall financial wellness score', category: 'manage-money', icon: 'HeartPulse', protected: true },
  { route: '/tax-documents', title: 'Tax Documents', description: 'Tax-related documents and reports', category: 'manage-money', icon: 'FileText', protected: true },
  { route: '/tax-analysis', title: 'Tax Document Analysis', description: 'AI-powered tax document analysis dashboard', category: 'manage-money', icon: 'BarChart3', protected: true },

  // =====================
  // GROW WEALTH (8)
  // =====================
  { route: '/investments', title: 'Investments', description: 'Portfolio tracking and tax optimization', category: 'grow-wealth', icon: 'LineChart', protected: true },
  { route: '/credit', title: 'Credit Score', description: 'Credit monitoring and improvement', category: 'grow-wealth', icon: 'Award', protected: true },
  { route: '/wallet', title: 'Wallet', description: 'Crypto wallet management', category: 'grow-wealth', icon: 'Wallet', protected: true },
  { route: '/wallet/settings', title: 'Wallet Settings', description: 'Wallet configuration', category: 'grow-wealth', icon: 'Settings', protected: true },
  { route: '/card', title: 'Card', description: 'Virtual card management', category: 'grow-wealth', icon: 'CreditCard', protected: true },
  { route: '/card/apply', title: 'Apply for Card', description: 'Credit card application', category: 'grow-wealth', icon: 'Plus', protected: true },
  { route: '/defi-manager', title: 'DeFi Manager', description: 'Decentralized finance tools', category: 'grow-wealth', icon: 'Layers', protected: true },
  { route: '/refinancing-hub', title: 'Refinancing Hub', description: 'Loan refinancing options', category: 'grow-wealth', icon: 'RefreshCcw', protected: true },

  // =====================
  // AI & INSIGHTS (6)
  // =====================
  { route: '/coach', title: 'AI Coach', description: 'Strategic financial command room', category: 'ai-insights', icon: 'Bot', protected: true },
  { route: '/ai-agents', title: 'AI Agents', description: 'Chat and autonomous agents', category: 'ai-insights', icon: 'Users', protected: true },
  { route: '/digital-twin', title: 'Digital Twin', description: 'Financial simulation and life planning', category: 'ai-insights', icon: 'User', protected: true },
  { route: '/lifesim', title: 'LifeSim', description: 'Gamified financial life simulator', category: 'ai-insights', icon: 'Gamepad2', protected: true },
  { route: '/analytics', title: 'Analytics', description: 'Advanced financial analytics and insights', category: 'ai-insights', icon: 'BarChart3', protected: true },
  { route: '/guardian', title: 'Guardian Security', description: 'Security command center', category: 'ai-insights', icon: 'Shield', protected: true },

  // =====================
  // LIFESTYLE (9)
  // =====================
  { route: '/family', title: 'Family', description: 'Family financial management', category: 'lifestyle', icon: 'Users', protected: true },
  { route: '/student', title: 'Student', description: 'Student financial tools', category: 'lifestyle', icon: 'GraduationCap', protected: true },
  { route: '/social', title: 'Social', description: 'Community and social features', category: 'lifestyle', icon: 'MessageCircle', protected: true },
  { route: '/leaderboard', title: 'Leaderboard', description: 'Savings competitions', category: 'lifestyle', icon: 'Trophy', protected: true },
  { route: '/achievements', title: 'Achievements', description: 'Badges and milestones', category: 'lifestyle', icon: 'Medal', protected: true },
  { route: '/literacy', title: 'Financial Literacy', description: 'Education and learning', category: 'lifestyle', icon: 'BookOpen', protected: true },
  { route: '/sustainability', title: 'Sustainability', description: 'Green finance tracking', category: 'lifestyle', icon: 'Leaf', protected: true },
  { route: '/integrations', title: 'Integrations', description: 'Third-party connections', category: 'lifestyle', icon: 'Link', protected: true },
  { route: '/cooling-off', title: 'Cooling Off', description: 'Impulse purchase prevention', category: 'lifestyle', icon: 'Clock', protected: true },

  // =====================
  // PREMIUM (6)
  // =====================
  { route: '/business-os', title: 'Business OS', description: 'Freelancer and business tools', category: 'premium', icon: 'Briefcase', protected: true },
  { route: '/family-office', title: 'Family Office', description: 'Wealth management for families', category: 'premium', icon: 'Building2', protected: true },
  { route: '/corporate-wellness', title: 'Corporate Wellness', description: 'Employee financial wellness', category: 'premium', icon: 'Building', protected: true },
  { route: '/whitelabel', title: 'White Label', description: 'White-label solutions', category: 'premium', icon: 'Tag', protected: true },
  { route: '/alternatives-portal', title: 'Alternatives Portal', description: 'Alternative investment options', category: 'premium', icon: 'Shuffle', protected: true },
  { route: '/features-hub', title: 'Features Hub', description: 'All features overview', category: 'premium', icon: 'Grid', protected: true },

  // =====================
  // ADMIN (5)
  // =====================
  { route: '/admin', title: 'Admin Dashboard', description: 'System administration', category: 'admin', icon: 'Shield', protected: true, adminOnly: true },
  { route: '/admin-monitoring', title: 'Admin Monitoring', description: 'System health monitoring', category: 'admin', icon: 'Activity', protected: true, adminOnly: true },
  { route: '/security-monitoring', title: 'Security Monitoring', description: 'Security event monitoring', category: 'admin', icon: 'Lock', protected: true, adminOnly: true },
  { route: '/claude-monitoring', title: 'Claude Monitoring', description: 'AI model performance', category: 'admin', icon: 'Cpu', protected: true, adminOnly: true },
  { route: '/ai-model-analytics', title: 'AI Model Analytics', description: 'AI routing and cost analysis', category: 'admin', icon: 'BarChart', protected: true, adminOnly: true },

  // =====================
  // UTILITY (11)
  // =====================
  { route: '/settings', title: 'Settings', description: 'Account and app settings', category: 'utility', icon: 'Settings', protected: true },
  { route: '/security-settings', title: 'Security Settings', description: 'Security preferences', category: 'utility', icon: 'Lock', protected: true },
  { route: '/help', title: 'Help Center', description: 'Support and documentation', category: 'utility', icon: 'HelpCircle', protected: true },
  { route: '/changelog', title: 'Changelog', description: 'Version history', category: 'utility', icon: 'History', protected: true },
  { route: '/search', title: 'Search', description: 'Global search', category: 'utility', icon: 'Search', protected: true },
  { route: '/welcome', title: 'Welcome', description: 'New user welcome flow', category: 'utility', icon: 'Sparkles', protected: false },
  { route: '/onboarding', title: 'Onboarding', description: 'User onboarding wizard', category: 'utility', icon: 'Compass', protected: false },
  { route: '/checkout', title: 'Checkout', description: 'Subscription checkout', category: 'utility', icon: 'ShoppingCart', protected: false },
  { route: '/subscription', title: 'Subscription Management', description: 'Manage subscription', category: 'utility', icon: 'CreditCard', protected: false },
  { route: '/maintenance', title: 'Maintenance', description: 'Maintenance mode page', category: 'utility', icon: 'Wrench', protected: false },
  { route: '/sitemap', title: 'Sitemap', description: 'Navigation sitemap', category: 'utility', icon: 'Map', protected: true, adminOnly: true },
];

// Redirects (13 total)
export const SITEMAP_REDIRECTS: Array<{ from: string; to: string; reason: string }> = [
  { from: '/security', to: '/guardian', reason: 'Consolidated into Guardian Security Center' },
  { from: '/agent-hub', to: '/ai-agents', reason: 'Merged autonomous delegations into AI Agents' },
  { from: '/insights', to: '/analytics?tab=cashflow', reason: 'Merged Insights into Analytics' },
  { from: '/digital-twin/analytics', to: '/digital-twin?tab=analytics', reason: 'Consolidated as tab' },
  { from: '/life-planner', to: '/digital-twin?tab=playbooks', reason: 'Merged into Digital Twin' },
  { from: '/hubs/memory', to: '/digital-twin?panel=memory', reason: 'Merged into Digital Twin' },
  { from: '/investment-manager', to: '/investments?tab=tax-optimization', reason: 'Merged into Investments' },
  { from: '/business', to: '/business-os', reason: 'Consolidated into Business OS' },
  { from: '/features', to: '/features-hub', reason: 'Route normalization' },
  
  { from: '/gamification', to: '/achievements', reason: 'Consolidated gamification features' },
  { from: '/life-events', to: '/digital-twin?tab=playbooks', reason: 'Merged into Digital Twin' },
  { from: '/advanced-analytics', to: '/analytics', reason: 'Consolidated analytics pages' },
];

// Preview pages (for development/debugging)
export const SITEMAP_PREVIEW_PAGES: SitemapPage[] = [
  { route: '/preview/guardian', title: 'Guardian Preview', description: 'Preview Guardian Security Center', category: 'utility', icon: 'Eye', protected: false },
  { route: '/preview/security-settings', title: 'Security Settings Preview', description: 'Preview Security Settings', category: 'utility', icon: 'Eye', protected: false },
  { route: '/preview/dashboard', title: 'Dashboard Preview', description: 'Preview Dashboard', category: 'utility', icon: 'Eye', protected: false },
  { route: '/preview/coach', title: 'Coach Preview', description: 'Preview AI Coach', category: 'utility', icon: 'Eye', protected: false },
  { route: '/preview/digital-twin', title: 'Digital Twin Preview', description: 'Preview Digital Twin', category: 'utility', icon: 'Eye', protected: false },
];

// Category metadata
export const CATEGORY_META: Record<PageCategory, { label: string; color: string; description: string }> = {
  public: { label: 'Public', color: 'gray', description: 'Accessible without authentication' },
  hub: { label: 'Navigation Hubs', color: 'blue', description: 'Main navigation entry points' },
  'manage-money': { label: 'Manage Money', color: 'green', description: 'Daily financial management' },
  'grow-wealth': { label: 'Grow Wealth', color: 'emerald', description: 'Wealth building and investments' },
  'ai-insights': { label: 'AI & Insights', color: 'violet', description: 'AI-powered features' },
  lifestyle: { label: 'Lifestyle', color: 'pink', description: 'Personal finance lifestyle' },
  premium: { label: 'Premium', color: 'amber', description: 'Premium and enterprise features' },
  admin: { label: 'Admin', color: 'red', description: 'Administration and monitoring' },
  utility: { label: 'Utility', color: 'slate', description: 'Settings and support' },
};

// Statistics
export const SITEMAP_STATS = {
  totalPages: SITEMAP_PAGES.length,
  totalRedirects: SITEMAP_REDIRECTS.length,
  totalPreviewPages: SITEMAP_PREVIEW_PAGES.length,
  byCategory: Object.fromEntries(
    Object.keys(CATEGORY_META).map(cat => [
      cat,
      SITEMAP_PAGES.filter(p => p.category === cat).length
    ])
  ),
  protectedPages: SITEMAP_PAGES.filter(p => p.protected).length,
  publicPages: SITEMAP_PAGES.filter(p => !p.protected).length,
  adminPages: SITEMAP_PAGES.filter(p => p.adminOnly).length,
};
