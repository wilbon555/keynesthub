import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Menu, X, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <img src="/lovable-uploads/8213b813-2daf-4854-8610-bcd75cb3bdfb.png" alt="Acres and Beyond logo icon" className="w-full h-full object-contain" loading="lazy" />
            </div>
            <span className="text-xl font-bold text-foreground">Acres and Beyond</span>
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
                          <a href="/#featured?type=house" className="block rounded-md p-2 hover:bg-accent text-foreground">Residential</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured?type=commercial" className="block rounded-md p-2 hover:bg-accent text-foreground">Commercial</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured?type=land" className="block rounded-md p-2 hover:bg-accent text-foreground">Land</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured" className="block rounded-md p-2 hover:bg-accent text-foreground">New Developments</a>
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
                          <a href="/?action=list" className="block rounded-md p-2 hover:bg-accent text-foreground">List Your Property</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="#" className="block rounded-md p-2 hover:bg-accent text-foreground">Pricing Plans</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="#" className="block rounded-md p-2 hover:bg-accent text-foreground">Agent Assistance</a>
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
                          <a href="/#featured?type=apartment" className="block rounded-md p-2 hover:bg-accent text-foreground">Apartments</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured?type=house" className="block rounded-md p-2 hover:bg-accent text-foreground">Houses</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured" className="block rounded-md p-2 hover:bg-accent text-foreground">Office Spaces</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured" className="block rounded-md p-2 hover:bg-accent text-foreground">Short Term</a>
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
                          <a href="/#featured" className="block rounded-md p-2 hover:bg-accent text-foreground">Find an Agent</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured" className="block rounded-md p-2 hover:bg-accent text-foreground">Become an Agent</a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Market Insights</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[300px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured" className="block rounded-md p-2 hover:bg-accent text-foreground">Property Trends</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/#featured" className="block rounded-md p-2 hover:bg-accent text-foreground">Mortgage Calculator</a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a href="/investment-tips" className="block rounded-md p-2 hover:bg-accent text-foreground">Investment Tips</a>
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
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/auth") }>
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
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
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-4">
              <div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Buy</div>
                <div className="mt-2 flex flex-col">
                  <a href="/#featured?type=house" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Residential</a>
                  <a href="/#featured?type=commercial" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Commercial</a>
                  <a href="/#featured?type=land" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Land</a>
                  <a href="/#featured" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">New Developments</a>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sell</div>
                <div className="mt-2 flex flex-col">
                  <a href="/?action=list" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">List Your Property</a>
                  <a href="#" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Pricing Plans</a>
                  <a href="#" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Agent Assistance</a>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Rent</div>
                <div className="mt-2 flex flex-col">
                  <a href="/#featured?type=apartment" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Apartments</a>
                  <a href="/#featured?type=house" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Houses</a>
                  <a href="/#featured" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Office Spaces</a>
                  <a href="/#featured" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Short Term</a>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Agents</div>
                <div className="mt-2 flex flex-col">
                  <a href="/#featured" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Find an Agent</a>
                  <a href="/#featured" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Become an Agent</a>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Market Insights</div>
                <div className="mt-2 flex flex-col">
                  <a href="/#featured" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Property Trends</a>
                  <a href="/#featured" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Mortgage Calculator</a>
                  <a href="/investment-tips" className="py-2 pl-2 text-foreground hover:text-primary transition-smooth">Investment Tips</a>
                </div>
              </div>

              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm" className="justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button variant="hero" size="sm" className="justify-start" onClick={() => navigate("/auth") }>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};