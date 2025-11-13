import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { initializeSessionManagement } from "@/lib/session";
import LiveRegion from "@/components/layout/LiveRegion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { AppLayout } from "./components/layout/AppLayout";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Subscriptions from "./pages/Subscriptions";
import Insights from "./pages/Insights";
import Budget from "./pages/Budget";
import Debts from "./pages/Debts";
import Investments from "./pages/Investments";
import Credit from "./pages/Credit";
import Welcome from "./pages/Welcome";
import IconDemo from "./pages/IconDemo";
import Coach from "./pages/Coach";
import Help from "./pages/Help";
import Pricing from "./pages/Pricing";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import Goals from "./pages/Goals";
import Pots from "./pages/Pots";
import Automations from "./pages/Automations";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Maintenance from "./pages/Maintenance";
import Achievements from "./pages/Achievements";
import BillNegotiation from "./pages/BillNegotiation";
import Family from "./pages/Family";
import Student from "./pages/Student";
import Business from "./pages/Business";
import WhiteLabel from "./pages/WhiteLabel";
import FinancialLiteracy from "./pages/FinancialLiteracy";
import Sustainability from "./pages/Sustainability";
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";
import Integrations from "./pages/Integrations";
import Admin from "./pages/Admin";
import FinancialHealth from "./pages/FinancialHealth";
import Leaderboard from "./pages/Leaderboard";

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
              <Maintenance />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <LiveRegion />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
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
        <Route 
          path="/welcome" 
          element={
            <AuthRedirect>
              <PageTransition>
                <Welcome />
              </PageTransition>
            </AuthRedirect>
          } 
        />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
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
