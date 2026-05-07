import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { PropertyChatBot } from "@/components/chat/PropertyChatBot";
import { IntentTriageModal } from "@/components/onboarding/IntentTriageModal";
import { SplashScreen } from "@/components/SplashScreen";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { UnconfirmedEmailNotice } from "@/components/auth/UnconfirmedEmailNotice";
import { useAuth } from "@/hooks/useAuth";

// Eager-load the landing page for fast first paint
import Index from "./pages/Index";

// Lazy-load everything else
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const InvestmentTips = lazy(() => import("./pages/InvestmentTips"));
const MortgageCalculator = lazy(() => import("./pages/MortgageCalculator"));
const BecomeAgent = lazy(() => import("./pages/BecomeAgent"));
const Install = lazy(() => import("./pages/Install"));
const Discover = lazy(() => import("./pages/Discover"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const BookProperty = lazy(() => import("./pages/BookProperty"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));

// Buy
const Residential = lazy(() => import("./pages/buy/Residential"));
const Commercial = lazy(() => import("./pages/buy/Commercial"));
const Land = lazy(() => import("./pages/buy/Land"));
const NewDevelopments = lazy(() => import("./pages/buy/NewDevelopments"));

// Sell
const ListProperty = lazy(() => import("./pages/sell/ListProperty"));
const PricingPlans = lazy(() => import("./pages/sell/PricingPlans"));
const AgentAssistance = lazy(() => import("./pages/sell/AgentAssistance"));
const Checkout = lazy(() => import("./pages/sell/Checkout"));

// Rent
const Apartments = lazy(() => import("./pages/rent/Apartments"));
const Houses = lazy(() => import("./pages/rent/Houses"));
const OfficeSpaces = lazy(() => import("./pages/rent/OfficeSpaces"));
const ShortTerm = lazy(() => import("./pages/rent/ShortTerm"));

// Agents
const FindAgent = lazy(() => import("./pages/agents/FindAgent"));
const AgentsDirectory = lazy(() => import("./pages/agents/AgentsDirectory"));

// Market
const PropertyTrends = lazy(() => import("./pages/market/PropertyTrends"));
const NeighborhoodGuide = lazy(() => import("./pages/neighborhoods/NeighborhoodGuide"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  </div>
);

const EmailConfirmationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    const isConfirmationHash = hash && (
      hash.includes('type=signup') || 
      hash.includes('type=email') || 
      hash.includes('type=recovery') ||
      hash.includes('access_token')
    );

    if (isConfirmationHash) {
      // Poll for session — up to 10 minutes (200 attempts × 3s)
      let attempts = 0;
      const maxAttempts = 200;
      const poll = setInterval(async () => {
        attempts++;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          clearInterval(poll);
          toast.success("Welcome to KeyNestHub! 🎉", {
            description: "Your email has been verified successfully.",
          });
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/dashboard', { replace: true });
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
        }
      }, 3000);

      return () => clearInterval(poll);
    }

    // Listen for auth state changes for confirmation events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        const currentHash = window.location.hash;
        const isConfirmation = currentHash.includes('type=signup') || currentHash.includes('type=email');
        const isOnLanding = location.pathname === '/';

        if (isConfirmation || (isOnLanding && currentHash.includes('access_token'))) {
          toast.success("Welcome to KeyNestHub! 🎉", {
            description: "Your email has been verified successfully.",
          });
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/dashboard', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
};

const GlobalUnconfirmedBanner = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading || !user) return null;
  if (user.email_confirmed_at || (user as any).confirmed_at) return null;
  if (location.pathname.startsWith("/auth")) return null;
  return <UnconfirmedEmailNotice variant="banner" />;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinished = useCallback(() => setShowSplash(false), []);

  return (
  <>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <EmailConfirmationHandler />
        <GlobalUnconfirmedBanner />
        <PropertyChatBot />
        <IntentTriageModal />
        <MobileBottomNav />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/book/:id" element={<ProtectedRoute><BookProperty /></ProtectedRoute>} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/agent-dashboard" element={<RoleProtectedRoute requiredRoles={['agent', 'admin']}><AgentDashboard /></RoleProtectedRoute>} />
            <Route path="/admin" element={<RoleProtectedRoute requiredRoles={['admin']}><AdminPanel /></RoleProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
  </>
  );
};

export default App;
