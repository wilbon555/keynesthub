import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X, User, LogOut, Shield, LayoutDashboard, Settings, Home, Sparkles, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";

import keyNestHubLogo from "@/assets/keynesthub-logo.png";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAgent, isAdmin } = useUserRoles();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
    }
  };

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - clickable to go home */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={keyNestHubLogo} alt="KeyNestHub logo icon" className="w-full h-full object-contain" loading="lazy" />
            </div>
            <span className="text-xl font-extrabold text-foreground tracking-tight">KeyNestHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Buy</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/buy/residential" className="block rounded-md p-2 hover:bg-accent text-foreground">Residential</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/buy/commercial" className="block rounded-md p-2 hover:bg-accent text-foreground">Commercial</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/buy/land" className="block rounded-md p-2 hover:bg-accent text-foreground">Land</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/buy/new-developments" className="block rounded-md p-2 hover:bg-accent text-foreground">New Developments</a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Sell</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[300px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/sell/list-property" className="block rounded-md p-2 hover:bg-accent text-foreground">List Your Property</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/sell/pricing-plans" className="block rounded-md p-2 hover:bg-accent text-foreground">Pricing Plans</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/sell/agent-assistance" className="block rounded-md p-2 hover:bg-accent text-foreground">Agent Assistance</a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Rent</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[300px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/rent/apartments" className="block rounded-md p-2 hover:bg-accent text-foreground">Apartments</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/rent/houses" className="block rounded-md p-2 hover:bg-accent text-foreground">Houses</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/rent/office-spaces" className="block rounded-md p-2 hover:bg-accent text-foreground">Office Spaces</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/rent/short-term" className="block rounded-md p-2 hover:bg-accent text-foreground">Short Term</a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Agents</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[300px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/agents/find-agent" className="block rounded-md p-2 hover:bg-accent text-foreground">Find an Agent</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/become-agent" className="block rounded-md p-2 hover:bg-accent text-foreground">Become an Agent</a>
                        </NavigationMenuLink>
                      </li>
                      {(isAgent || isAdmin) && (
                        <li>
                          <NavigationMenuLink asChild>
                            <a href="/agent-dashboard" className="block rounded-md p-2 hover:bg-accent text-foreground font-medium text-primary">
                              <Shield className="inline w-4 h-4 mr-2" />
                              Agent Dashboard
                            </a>
                          </NavigationMenuLink>
                        </li>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Market Insights</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[300px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/market/property-trends" className="block rounded-md p-2 hover:bg-accent text-foreground">Property Trends</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/mortgage-calculator" className="block rounded-md p-2 hover:bg-accent text-foreground">Mortgage Calculator</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/investment-tips" className="block rounded-md p-2 hover:bg-accent text-foreground">Investment Tips</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/neighborhoods" className="block rounded-md p-2 hover:bg-accent text-foreground">Neighborhood Guides</a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>




              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/discover")}
              className="text-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Discover
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-primary">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/about")}>
              About Us
            </Button>
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button variant="hero" size="sm" onClick={() => navigate("/sell/pricing-plans")}>
                <User className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border animate-fade-in">
            <ScrollArea className="h-[calc(100vh-4rem)] py-4">
              <div className="flex flex-col space-y-2 px-4">
                {/* Home link for mobile */}
                <a href="/" className="flex items-center py-2 text-primary font-semibold hover:text-primary/80 transition-smooth">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
                <a href="/discover" className="flex items-center py-2 text-primary font-semibold hover:text-primary/80 transition-smooth">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Discover
                </a>

                {/* Collapsible accordion sections */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Buy
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col">
                    <a href="/buy/residential" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Residential</a>
                    <a href="/buy/commercial" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Commercial</a>
                    <a href="/buy/land" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Land</a>
                    <a href="/buy/new-developments" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">New Developments</a>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Sell
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col">
                    <a href="/sell/list-property" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">List Your Property</a>
                    <a href="/sell/pricing-plans" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Pricing Plans</a>
                    <a href="/sell/agent-assistance" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Agent Assistance</a>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Rent
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col">
                    <a href="/rent/apartments" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Apartments</a>
                    <a href="/rent/houses" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Houses</a>
                    <a href="/rent/office-spaces" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Office Spaces</a>
                    <a href="/rent/short-term" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Short Term</a>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Agents
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col">
                    <a href="/agents/find-agent" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Find an Agent</a>
                    <a href="/become-agent" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Become an Agent</a>
                    {(isAgent || isAdmin) && (
                      <a href="/agent-dashboard" className="py-2 pl-4 text-primary font-medium hover:text-primary/80 transition-smooth">
                        <Shield className="inline w-4 h-4 mr-2" />
                        Agent Dashboard
                      </a>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Market Insights
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col">
                    <a href="/market/property-trends" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Property Trends</a>
                    <a href="/mortgage-calculator" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Mortgage Calculator</a>
                    <a href="/investment-tips" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Investment Tips</a>
                    <a href="/neighborhoods" className="py-2 pl-4 text-foreground hover:text-primary transition-smooth">Neighborhood Guides</a>
                  </CollapsibleContent>
                </Collapsible>

                <a href="/about" className="flex items-center py-2 text-primary font-semibold hover:text-primary/80 transition-smooth">
                  About Us
                </a>

                <div className="flex flex-col space-y-2 pt-4">
                  {user && (
                    <Button variant="ghost" size="sm" className="justify-start" onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  )}
                  {isAdmin && (
                    <Button variant="ghost" size="sm" className="justify-start text-primary" onClick={() => navigate("/admin")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  {user ? (
                    <Button variant="outline" size="sm" className="justify-start" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button variant="hero" size="sm" className="justify-start" onClick={() => navigate("/sell/pricing-plans")}>
                      <User className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </nav>
  );
};