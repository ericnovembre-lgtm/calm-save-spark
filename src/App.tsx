import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
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
import { LoadingState } from "./components/LoadingState";

// Lazy load all pages for optimal code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Insights = lazy(() => import("./pages/Insights"));
const Budget = lazy(() => import("./pages/Budget"));
const Debts = lazy(() => import("./pages/Debts"));
const Investments = lazy(() => import("./pages/Investments"));
const Credit = lazy(() => import("./pages/Credit"));
const Welcome = lazy(() => import("./pages/Welcome"));
const IconDemo = lazy(() => import("./pages/IconDemo"));
const Coach = lazy(() => import("./pages/Coach"));
const Help = lazy(() => import("./pages/Help"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Checkout = lazy(() => import("./pages/Checkout"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const Goals = lazy(() => import("./pages/Goals"));
const Pots = lazy(() => import("./pages/Pots"));
const Automations = lazy(() => import("./pages/Automations"));
const Settings = lazy(() => import("./pages/Settings"));
const Auth = lazy(() => import("./pages/Auth"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Achievements = lazy(() => import("./pages/Achievements"));
const BillNegotiation = lazy(() => import("./pages/BillNegotiation"));
const Family = lazy(() => import("./pages/Family"));
const Student = lazy(() => import("./pages/Student"));
const Business = lazy(() => import("./pages/Business"));
const WhiteLabel = lazy(() => import("./pages/WhiteLabel"));
const FinancialLiteracy = lazy(() => import("./pages/FinancialLiteracy"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Social = lazy(() => import("./pages/Social"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Admin = lazy(() => import("./pages/Admin"));
const FinancialHealth = lazy(() => import("./pages/FinancialHealth"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Install = lazy(() => import("./pages/Install"));

const queryClient = new QueryClient();

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
              <Suspense fallback={<LoadingState />}>
                <Maintenance />
              </Suspense>
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
            <TooltipProvider>
              <LiveRegion />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <PageTracker />
                <InstallPrompt />
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundaryWithRetry>
    </ErrorBoundary>
  );
};

/**
 * AnimatedRoutes - Routes wrapper with AnimatePresence for page transitions
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes without layout */}
        <Route 
          path="/" 
          element={
            <AuthRedirect>
              <PageTransition>
                <Welcome />
              </PageTransition>
            </AuthRedirect>
          } 
        />
        {/* Redirect /welcome to / for backward compatibility */}
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/subscription" element={<PageTransition><SubscriptionManagement /></PageTransition>} />
        
        {/* App routes with layout - protected */}
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/financial-health" element={<ProtectedRoute><PageTransition><FinancialHealth /></PageTransition></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><PageTransition><Transactions /></PageTransition></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><PageTransition><Subscriptions /></PageTransition></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><PageTransition><Insights /></PageTransition></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><PageTransition><Budget /></PageTransition></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><PageTransition><Debts /></PageTransition></ProtectedRoute>} />
        <Route path="/investments" element={<ProtectedRoute><PageTransition><Investments /></PageTransition></ProtectedRoute>} />
        <Route path="/credit" element={<ProtectedRoute><PageTransition><Credit /></PageTransition></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><PageTransition><Goals /></PageTransition></ProtectedRoute>} />
        <Route path="/pots" element={<ProtectedRoute><PageTransition><Pots /></PageTransition></ProtectedRoute>} />
        <Route path="/automations" element={<ProtectedRoute><PageTransition><Automations /></PageTransition></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Rewards - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Analytics - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        <Route path="/card" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Card - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><PageTransition><Coach /></PageTransition></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><PageTransition><Help /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
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
        <Route path="/admin-agents" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Admin Agents - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        <Route path="/admin-functions" element={<ProtectedRoute><PageTransition><AppLayout><div className="container mx-auto p-8">Admin Functions - Coming Soon</div></AppLayout></PageTransition></ProtectedRoute>} />
        
        {/* Icon System Demo */}
        <Route path="/icon-demo" element={<PageTransition><IconDemo /></PageTransition>} />
        
        {/* Maintenance Page */}
        <Route path="/maintenance" element={<PageTransition><Maintenance /></PageTransition>} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
