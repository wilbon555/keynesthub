import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchSection } from "./SearchSection";
import { PhotoUpload } from "./PhotoUpload";
import { TrendingUp, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export const HeroSection = () => {
  const [showUpload, setShowUpload] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'list') {
      if (user) {
        setShowUpload(true);
      } else {
        navigate(`/auth?redirect=${encodeURIComponent('/')}`);
      }
    }
  }, [searchParams, user, navigate]);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Beautiful Property" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Find Your Perfect
              <span className="block text-accent"> Property</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Discover amazing properties, land, and real estate opportunities 
              with our comprehensive marketplace.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => {
                searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                  const input = document.querySelector('input[placeholder="Location or ZIP code"]') as HTMLInputElement | null;
                  input?.focus();
                }, 500);
              }}
            >
              Start Searching
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 bg-card/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => {
                if (user) {
                  setShowUpload(true)
                } else {
                  navigate(`/auth?redirect=${encodeURIComponent('/')}`)
                }
              }}
            >
              List Your Property
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="flex flex-col items-center space-y-2 text-primary-foreground">
              <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm opacity-90">Properties Listed</div>
            </div>
            <div className="flex flex-col items-center space-y-2 text-primary-foreground">
              <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm opacity-90">Happy Customers</div>
            </div>
            <div className="flex flex-col items-center space-y-2 text-primary-foreground">
              <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm opacity-90">Years Experience</div>
            </div>
          </div>
        </div>
        
        {/* Search Section */}
        <div className="mt-12 animate-slide-up" ref={searchRef}>
          <SearchSection />
        </div>
      </div>

      <PhotoUpload open={showUpload} onOpenChange={setShowUpload} />
    </section>
  );
};