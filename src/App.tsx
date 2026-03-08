import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyChatBot } from "@/components/chat/PropertyChatBot";
import { IntentTriageModal } from "@/components/onboarding/IntentTriageModal";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminPanel from "./pages/AdminPanel";
import InvestmentTips from "./pages/InvestmentTips";
import MortgageCalculator from "./pages/MortgageCalculator";
import BecomeAgent from "./pages/BecomeAgent";
import Install from "./pages/Install";
import Discover from "./pages/Discover";
import PropertyDetail from "./pages/PropertyDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Buy pages
import Residential from "./pages/buy/Residential";
import Commercial from "./pages/buy/Commercial";
import Land from "./pages/buy/Land";
import NewDevelopments from "./pages/buy/NewDevelopments";

// Sell pages
import ListProperty from "./pages/sell/ListProperty";
import PricingPlans from "./pages/sell/PricingPlans";
import AgentAssistance from "./pages/sell/AgentAssistance";
import Checkout from "./pages/sell/Checkout";

// Rent pages
import Apartments from "./pages/rent/Apartments";
import Houses from "./pages/rent/Houses";
import OfficeSpaces from "./pages/rent/OfficeSpaces";
import ShortTerm from "./pages/rent/ShortTerm";

// Agent pages
import FindAgent from "./pages/agents/FindAgent";
import AgentsDirectory from "./pages/agents/AgentsDirectory";

// Market pages
import PropertyTrends from "./pages/market/PropertyTrends";
import NeighborhoodGuide from "./pages/neighborhoods/NeighborhoodGuide";
import About from "./pages/About";
const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinished = useCallback(() => setShowSplash(false), []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
      <Toaster />
      <Sonner />
      <PropertyChatBot />
      <BrowserRouter>
        <IntentTriageModal />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/agent-dashboard" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/install" element={<Install />} />
          
          {/* Buy Routes */}
          <Route path="/buy/residential" element={<Residential />} />
          <Route path="/buy/commercial" element={<Commercial />} />
          <Route path="/buy/land" element={<Land />} />
          <Route path="/buy/new-developments" element={<NewDevelopments />} />
          
          {/* Sell Routes */}
          <Route path="/sell/list-property" element={<ListProperty />} />
          <Route path="/sell/pricing-plans" element={<PricingPlans />} />
          <Route path="/sell/agent-assistance" element={<AgentAssistance />} />
          <Route path="/sell/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          
          {/* Rent Routes */}
          <Route path="/rent/apartments" element={<Apartments />} />
          <Route path="/rent/houses" element={<Houses />} />
          <Route path="/rent/office-spaces" element={<OfficeSpaces />} />
          <Route path="/rent/short-term" element={<ShortTerm />} />
          
          {/* Agent Routes */}
          <Route path="/agents/find-agent" element={<FindAgent />} />
          <Route path="/agents/directory" element={<AgentsDirectory />} />
          <Route path="/become-agent" element={<BecomeAgent />} />
          
          {/* Market Routes */}
          <Route path="/market/property-trends" element={<PropertyTrends />} />
          <Route path="/investment-tips" element={<InvestmentTips />} />
          <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
          
          {/* About */}
          <Route path="/about" element={<About />} />

          {/* Neighborhood Guides */}
          <Route path="/neighborhoods" element={<NeighborhoodGuide />} />
          <Route path="/neighborhoods/:slug" element={<NeighborhoodGuide />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
