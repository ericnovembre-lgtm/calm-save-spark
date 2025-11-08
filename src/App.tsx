import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { initializeSessionManagement } from "@/lib/session";
import LiveRegion from "@/components/layout/LiveRegion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

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
          <Routes>
            {/* Public routes without layout */}
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/subscription" element={<SubscriptionManagement />} />
            
            {/* App routes with layout - protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
            <Route path="/debts" element={<ProtectedRoute><Debts /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
            <Route path="/credit" element={<ProtectedRoute><Credit /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/pots" element={<ProtectedRoute><Pots /></ProtectedRoute>} />
            <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><AppLayout><div className="container mx-auto p-8">Rewards - Coming Soon</div></AppLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AppLayout><div className="container mx-auto p-8">Analytics - Coming Soon</div></AppLayout></ProtectedRoute>} />
            <Route path="/card" element={<ProtectedRoute><AppLayout><div className="container mx-auto p-8">Card - Coming Soon</div></AppLayout></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/bill-negotiation" element={<ProtectedRoute><BillNegotiation /></ProtectedRoute>} />
            <Route path="/family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
            <Route path="/student" element={<ProtectedRoute><Student /></ProtectedRoute>} />
            <Route path="/admin-agents" element={<ProtectedRoute><AppLayout><div className="container mx-auto p-8">Admin Agents - Coming Soon</div></AppLayout></ProtectedRoute>} />
            <Route path="/admin-functions" element={<ProtectedRoute><AppLayout><div className="container mx-auto p-8">Admin Functions - Coming Soon</div></AppLayout></ProtectedRoute>} />
            
            {/* Icon System Demo */}
            <Route path="/icon-demo" element={<IconDemo />} />
            
            {/* Maintenance Page */}
            <Route path="/maintenance" element={<Maintenance />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
