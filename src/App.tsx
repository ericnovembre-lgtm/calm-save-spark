import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import LiveRegion from "@/components/layout/LiveRegion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import Goals from "./pages/Goals";
import Pots from "./pages/Pots";
import Automations from "./pages/Automations";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/subscription" element={<SubscriptionManagement />} />
            
            {/* App routes with layout */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/credit" element={<Credit />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/pots" element={<Pots />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/rewards" element={<AppLayout><div className="container mx-auto p-8">Rewards - Coming Soon</div></AppLayout>} />
            <Route path="/analytics" element={<AppLayout><div className="container mx-auto p-8">Analytics - Coming Soon</div></AppLayout>} />
            <Route path="/card" element={<AppLayout><div className="container mx-auto p-8">Card - Coming Soon</div></AppLayout>} />
            <Route path="/coach" element={<AppLayout><Coach /></AppLayout>} />
            <Route path="/help" element={<AppLayout><Help /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><div className="container mx-auto p-8">Settings - Coming Soon</div></AppLayout>} />
            <Route path="/admin-agents" element={<AppLayout><div className="container mx-auto p-8">Admin Agents - Coming Soon</div></AppLayout>} />
            <Route path="/admin-functions" element={<AppLayout><div className="container mx-auto p-8">Admin Functions - Coming Soon</div></AppLayout>} />
            
            {/* Icon System Demo */}
            <Route path="/icon-demo" element={<IconDemo />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
