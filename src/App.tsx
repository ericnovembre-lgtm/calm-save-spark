import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { initializeSessionManagement } from "@/lib/session";
import LiveRegion from "@/components/layout/LiveRegion";
import { PageTracker } from "@/components/layout/PageTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorBoundaryWithRetry } from "@/components/ErrorBoundaryWithRetry";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { AppLayout } from "./components/layout/AppLayout";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { useIntelligentPrefetch } from "@/hooks/useIntelligentPrefetch";
import { useWebVitals } from "@/hooks/useWebVitals";
import { queryConfig } from "@/lib/query-config";
import { createPageLoader } from "@/components/performance/PageLazyLoader";
import { FloatingHelpButton } from "@/components/help/FloatingHelpButton";
import "@/styles/accessibility.css";

// ============================================================
// Performance-optimized page loading with category-aware skeletons
// Heavy: Dashboard, Analytics, Charts, 3D components (18 pages)
// Medium: Lists, Forms, Feature pages (25 pages)
// Light: Auth, Static content, Simple pages (20 pages)
// ============================================================

// HEAVY PAGES - Complex UI, charts, 3D, heavy calculations
const Dashboard = createPageLoader(() => import("./pages/Dashboard"), 'heavy');
const Analytics = createPageLoader(() => import("./pages/Analytics"), 'heavy');
const Budget = createPageLoader(() => import("./pages/Budget"), 'heavy');
const Goals = createPageLoader(() => import("./pages/Goals"), 'heavy');
const Insights = createPageLoader(() => import("./pages/Insights"), 'heavy');
const Pricing = createPageLoader(() => import("./pages/Pricing"), 'heavy');
const Coach = createPageLoader(() => import("./pages/Coach"), 'heavy');
const DigitalTwin = createPageLoader(() => import("./pages/DigitalTwin"), 'heavy');
const LifeSim = createPageLoader(() => import("./pages/LifeSim"), 'heavy');
const LifePlanner = createPageLoader(() => import("./pages/LifePlanner"), 'heavy');
const InvestmentManager = createPageLoader(() => import("./pages/InvestmentManager"), 'heavy');
const DeFiManager = createPageLoader(() => import("./pages/DeFiManager"), 'heavy');
const BusinessOS = createPageLoader(() => import("./pages/BusinessOS"), 'heavy');
const FamilyOffice = createPageLoader(() => import("./pages/FamilyOffice"), 'heavy');
const Admin = createPageLoader(() => import("./pages/Admin"), 'heavy');
const AdminMonitoring = createPageLoader(() => import("./pages/AdminMonitoring"), 'heavy');
const SecurityMonitoring = createPageLoader(() => import("./pages/SecurityMonitoring"), 'heavy');
const Security = createPageLoader(() => import("./pages/Security"), 'heavy');
const FinancialHealth = createPageLoader(() => import("./pages/FinancialHealth"), 'heavy');

// MEDIUM PAGES - Lists, transactions, moderate complexity
const Transactions = createPageLoader(() => import("./pages/Transactions"), 'medium');
const Subscriptions = createPageLoader(() => import("./pages/Subscriptions"), 'medium');
const Debts = createPageLoader(() => import("./pages/Debts"), 'medium');
const Investments = createPageLoader(() => import("./pages/Investments"), 'medium');
const Credit = createPageLoader(() => import("./pages/Credit"), 'medium');
const Pots = createPageLoader(() => import("./pages/Pots"), 'medium');
const Automations = createPageLoader(() => import("./pages/Automations"), 'medium');
const Settings = createPageLoader(() => import("./pages/Settings"), 'medium');
const Achievements = createPageLoader(() => import("./pages/Achievements"), 'medium');
const BillNegotiation = createPageLoader(() => import("./pages/BillNegotiation"), 'medium');
const Family = createPageLoader(() => import("./pages/Family"), 'medium');
const Student = createPageLoader(() => import("./pages/Student"), 'medium');
const Business = createPageLoader(() => import("./pages/Business"), 'medium');
const WhiteLabel = createPageLoader(() => import("./pages/WhiteLabel"), 'medium');
const FinancialLiteracy = createPageLoader(() => import("./pages/FinancialLiteracy"), 'medium');
const Sustainability = createPageLoader(() => import("./pages/Sustainability"), 'medium');
const Social = createPageLoader(() => import("./pages/Social"), 'medium');
const Integrations = createPageLoader(() => import("./pages/Integrations"), 'medium');
const Accounts = createPageLoader(() => import("./pages/Accounts"), 'medium');
const Leaderboard = createPageLoader(() => import("./pages/Leaderboard"), 'medium');
const Wallet = createPageLoader(() => import("./pages/Wallet"), 'medium');
const Card = createPageLoader(() => import("./pages/Card"), 'medium');
const TaxDocuments = createPageLoader(() => import("./pages/TaxDocuments"), 'medium');
const AIAgents = createPageLoader(() => import("./pages/AIAgents"), 'medium');
const Gamification = createPageLoader(() => import("./pages/Gamification"), 'medium');

// Hub pages (Medium complexity)
const ManageMoneyHub = createPageLoader(() => import("./pages/hubs/ManageMoneyHub"), 'medium');
const GrowWealthHub = createPageLoader(() => import("./pages/hubs/GrowWealthHub"), 'medium');
const AIInsightsHub = createPageLoader(() => import("./pages/hubs/AIInsightsHub"), 'medium');
const LifestyleHub = createPageLoader(() => import("./pages/hubs/LifestyleHub"), 'medium');
const PremiumHub = createPageLoader(() => import("./pages/hubs/PremiumHub"), 'medium');
const FeaturesHub = createPageLoader(() => import("./pages/FeaturesHub"), 'medium');
const AgentHub = createPageLoader(() => import("./pages/AgentHub"), 'medium');
const RefinancingHub = createPageLoader(() => import("./pages/RefinancingHub"), 'medium');

// LIGHT PAGES - Auth, static content, simple UI
const Landing = createPageLoader(() => import("./pages/Landing"), 'light');
const Auth = createPageLoader(() => import("./pages/Auth"), 'light');
const Help = createPageLoader(() => import("./pages/Help"), 'light');
const NotFound = createPageLoader(() => import("./pages/NotFound"), 'light');
const Maintenance = createPageLoader(() => import("./pages/Maintenance"), 'light');
const Search = createPageLoader(() => import("./pages/Search"), 'light');
const Install = createPageLoader(() => import("./pages/Install"), 'light');
const IconDemo = createPageLoader(() => import("./pages/IconDemo"), 'light');
const Onboarding = createPageLoader(() => import("./pages/Onboarding"), 'light');
const ConversationalWelcome = createPageLoader(() => import("./pages/ConversationalWelcome"), 'light');
const Checkout = createPageLoader(() => import("./pages/Checkout"), 'light');
const SubscriptionManagement = createPageLoader(() => import("./pages/SubscriptionManagement"), 'light');
const BehavioralGuardian = createPageLoader(() => import("./pages/BehavioralGuardian"), 'light');
const CoolingOff = createPageLoader(() => import("./pages/CoolingOff"), 'light');
const AlternativesPortal = createPageLoader(() => import("./pages/AlternativesPortal"), 'light');
const CorporateWellness = createPageLoader(() => import("./pages/CorporateWellness"), 'light');
const CardApply = createPageLoader(() => import("./pages/CardApply"), 'light');
const LifeEvents = createPageLoader(() => import("./pages/LifeEvents"), 'light');

const queryClient = new QueryClient(queryConfig);

// Performance monitoring with per-page tracking
const PerformanceMonitoring = () => {
  const { pageMetrics } = useWebVitals(true);
  useIntelligentPrefetch();
  
  // Log page metrics in development
  useEffect(() => {
    if (import.meta.env.DEV && Object.keys(pageMetrics).length > 0) {
      console.log('[Performance] Page metrics:', pageMetrics);
    }
  }, [pageMetrics]);
  
  return null;
};

const App = () => {
  // Initialize session management on app startup
  useEffect(() => {
    initializeSessionManagement();
  }, []);

  // Check for maintenance mode
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // If maintenance mode is enabled, show maintenance page for all routes except /maintenance
  if (isMaintenanceMode && window.location.pathname !== '/maintenance') {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <Maintenance />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ErrorBoundaryWithRetry>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <LiveRegion />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <PageTracker />
                  <InstallPrompt />
                  <AnimatedRoutes />
                  <ConditionalHelpButton />
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundaryWithRetry>
    </ErrorBoundary>
  );
};

/**
 * ConditionalHelpButton - Only show help widget on authenticated pages
 */
function ConditionalHelpButton() {
  const location = useLocation();
  
  // Hide on landing page
  if (location.pathname === '/') {
    return null;
  }
  
  return <FloatingHelpButton />;
}

/**
 * AnimatedRoutes - Routes wrapper with AnimatePresence for page transitions
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <PerformanceMonitoring />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Public routes without layout */}
        <Route 
          path="/" 
          element={
            <AuthRedirect>
              <PageTransition>
                <Landing />
              </PageTransition>
            </AuthRedirect>
          } 
        />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
        <Route path="/welcome" element={<PageTransition><ConversationalWelcome /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/subscription" element={<PageTransition><SubscriptionManagement /></PageTransition>} />
        
        {/* App routes with layout - protected */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><PageTransition><Accounts /></PageTransition></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><PageTransition><Search /></PageTransition></ProtectedRoute>} />
        <Route path="/financial-health" element={<ProtectedRoute><PageTransition><FinancialHealth /></PageTransition></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><PageTransition><Transactions /></PageTransition></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><PageTransition><Subscriptions /></PageTransition></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><PageTransition><Insights /></PageTransition></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><PageTransition><Budget /></PageTransition></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><PageTransition><Debts /></PageTransition></ProtectedRoute>} />
        <Route path="/investments" element={<ProtectedRoute><PageTransition><Investments /></PageTransition></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><PageTransition><Wallet /></PageTransition></ProtectedRoute>} />
        <Route path="/credit" element={<ProtectedRoute><PageTransition><Credit /></PageTransition></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><PageTransition><Goals /></PageTransition></ProtectedRoute>} />
        <Route path="/pots" element={<ProtectedRoute><PageTransition><Pots /></PageTransition></ProtectedRoute>} />
        <Route path="/automations" element={<ProtectedRoute><PageTransition><Automations /></PageTransition></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Rewards - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Analytics - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        <Route path="/card" element={<ProtectedRoute><PageTransition><Card /></PageTransition></ProtectedRoute>} />
        <Route path="/card/apply" element={<ProtectedRoute><PageTransition><CardApply /></PageTransition></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><PageTransition><Coach /></PageTransition></ProtectedRoute>} />
        <Route path="/ai-agents" element={<ProtectedRoute><PageTransition><AIAgents /></PageTransition></ProtectedRoute>} />
        <Route path="/features-hub" element={<ProtectedRoute><PageTransition><FeaturesHub /></PageTransition></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><PageTransition><Help /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><PageTransition><Security /></PageTransition></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><PageTransition><Achievements /></PageTransition></ProtectedRoute>} />
        <Route path="/bill-negotiation" element={<ProtectedRoute><PageTransition><BillNegotiation /></PageTransition></ProtectedRoute>} />
        <Route path="/family" element={<ProtectedRoute><PageTransition><Family /></PageTransition></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute><PageTransition><Student /></PageTransition></ProtectedRoute>} />
        <Route path="/business" element={<ProtectedRoute><PageTransition><Business /></PageTransition></ProtectedRoute>} />
        <Route path="/whitelabel" element={<ProtectedRoute><PageTransition><WhiteLabel /></PageTransition></ProtectedRoute>} />
        <Route path="/literacy" element={<ProtectedRoute><PageTransition><FinancialLiteracy /></PageTransition></ProtectedRoute>} />
        <Route path="/sustainability" element={<ProtectedRoute><PageTransition><Sustainability /></PageTransition></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageTransition><Analytics /></PageTransition></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><PageTransition><Social /></PageTransition></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><PageTransition><Leaderboard /></PageTransition></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><PageTransition><Integrations /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageTransition><AdminRoute><Admin /></AdminRoute></PageTransition></ProtectedRoute>} />
        <Route path="/security-monitoring" element={<ProtectedRoute><PageTransition><AdminRoute><SecurityMonitoring /></AdminRoute></PageTransition></ProtectedRoute>} />
        <Route path="/admin-monitoring" element={<ProtectedRoute><PageTransition><AdminRoute><AdminMonitoring /></AdminRoute></PageTransition></ProtectedRoute>} />
        <Route path="/admin-agents" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Admin Agents - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        <Route path="/admin-functions" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Admin Functions - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        
        {/* Premium Solutions */}
        <Route path="/alternatives-portal" element={<ProtectedRoute><PageTransition><AlternativesPortal /></PageTransition></ProtectedRoute>} />
        <Route path="/family-office" element={<ProtectedRoute><PageTransition><FamilyOffice /></PageTransition></ProtectedRoute>} />
        <Route path="/corporate-wellness" element={<ProtectedRoute><PageTransition><CorporateWellness /></PageTransition></ProtectedRoute>} />
        
        {/* Feature Hubs */}
        <Route path="/hubs/manage-money" element={<ProtectedRoute><PageTransition><ManageMoneyHub /></PageTransition></ProtectedRoute>} />
        <Route path="/hubs/grow-wealth" element={<ProtectedRoute><PageTransition><GrowWealthHub /></PageTransition></ProtectedRoute>} />
        <Route path="/hubs/ai-insights" element={<ProtectedRoute><PageTransition><AIInsightsHub /></PageTransition></ProtectedRoute>} />
        <Route path="/hubs/lifestyle" element={<ProtectedRoute><PageTransition><LifestyleHub /></PageTransition></ProtectedRoute>} />
        <Route path="/hubs/premium" element={<ProtectedRoute><PageTransition><PremiumHub /></PageTransition></ProtectedRoute>} />
        
        {/* Next-Gen Features */}
        <Route path="/digital-twin" element={<ProtectedRoute><PageTransition><DigitalTwin /></PageTransition></ProtectedRoute>} />
        <Route path="/agent-hub" element={<ProtectedRoute><PageTransition><AgentHub /></PageTransition></ProtectedRoute>} />
        <Route path="/guardian" element={<ProtectedRoute><PageTransition><BehavioralGuardian /></PageTransition></ProtectedRoute>} />
        <Route path="/cooling-off" element={<ProtectedRoute><PageTransition><CoolingOff /></PageTransition></ProtectedRoute>} />
        <Route path="/lifesim" element={<ProtectedRoute><PageTransition><LifeSim /></PageTransition></ProtectedRoute>} />
        <Route path="/life-planner" element={<ProtectedRoute><PageTransition><LifePlanner /></PageTransition></ProtectedRoute>} />
        <Route path="/gamification" element={<ProtectedRoute><PageTransition><Gamification /></PageTransition></ProtectedRoute>} />
        <Route path="/tax-documents" element={<ProtectedRoute><PageTransition><TaxDocuments /></PageTransition></ProtectedRoute>} />
        <Route path="/investment-manager" element={<ProtectedRoute><PageTransition><InvestmentManager /></PageTransition></ProtectedRoute>} />
        <Route path="/refinancing-hub" element={<ProtectedRoute><PageTransition><RefinancingHub /></PageTransition></ProtectedRoute>} />
        <Route path="/life-events" element={<ProtectedRoute><PageTransition><LifeEvents /></PageTransition></ProtectedRoute>} />
        <Route path="/business-os" element={<ProtectedRoute><PageTransition><BusinessOS /></PageTransition></ProtectedRoute>} />
        <Route path="/defi-manager" element={<ProtectedRoute><PageTransition><DeFiManager /></PageTransition></ProtectedRoute>} />
        
        {/* Icon System Demo */}
        <Route path="/icon-demo" element={<PageTransition><IconDemo /></PageTransition>} />
        
        {/* Maintenance Page */}
        <Route path="/maintenance" element={<PageTransition><Maintenance /></PageTransition>} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    </>
  );
}

export default App;
