import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import LiveRegion from "@/components/layout/LiveRegion";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import IconDemo from "./pages/IconDemo";
import Coach from "./pages/Coach";
import Help from "./pages/Help";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/auth" element={<div className="min-h-screen flex items-center justify-center p-8">Auth - Coming Soon</div>} />
            
            {/* App routes with layout */}
            <Route path="/dashboard" element={<AppLayout><div className="container mx-auto p-8">Dashboard - Coming Soon</div></AppLayout>} />
            <Route path="/goals" element={<AppLayout><div className="container mx-auto p-8">Goals - Coming Soon</div></AppLayout>} />
            <Route path="/pots" element={<AppLayout><div className="container mx-auto p-8">Pots - Coming Soon</div></AppLayout>} />
            <Route path="/automations" element={<AppLayout><div className="container mx-auto p-8">Automations - Coming Soon</div></AppLayout>} />
            <Route path="/rewards" element={<AppLayout><div className="container mx-auto p-8">Rewards - Coming Soon</div></AppLayout>} />
            <Route path="/insights" element={<AppLayout><div className="container mx-auto p-8">Insights - Coming Soon</div></AppLayout>} />
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
);

export default App;
