import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, Phone, User } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PropertyHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">Buy</a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">Sell</a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">Rent</a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">Agents</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
            <Button variant="hero" size="sm">
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
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium py-2">Buy</a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium py-2">Sell</a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium py-2">Rent</a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium py-2">Agents</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm" className="justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button variant="hero" size="sm" className="justify-start">
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