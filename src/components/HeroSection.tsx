import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchSection } from "./SearchSection";
import { PhotoUpload } from "./PhotoUpload";
import { TrendingUp, Users, Award, Search } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
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
    <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center bg-gradient-hero overflow-hidden pb-4 md:pb-0">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          className="w-full h-full object-cover opacity-25"
        >
          <source src="https://videos.pexels.com/video-files/7578548/7578548-hd_1920_1080_30fps.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
          <img 
            src={heroImage} 
            alt="Premium real estate properties in Kenya - KeyNestHub" 
            className="w-full h-full object-cover"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-4xl mx-auto space-y-4 md:space-y-8"
        >
          <div className="space-y-2 md:space-y-4">
            <h1 className="text-3xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Find Your Perfect
              <span className="block text-accent"> Property</span>
            </h1>
            <p className="text-base md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Discover amazing properties, land, and real estate opportunities 
              with our comprehensive marketplace.
            </p>
          </div>
          
          {/* Mobile: single search input */}
          <div className="md:hidden w-full max-w-md mx-auto">
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/discover")}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                readOnly
                placeholder="Search properties, locations..."
                className="pl-12 pr-4 h-12 rounded-2xl bg-card/90 backdrop-blur-sm border-primary-foreground/20 text-foreground placeholder:text-muted-foreground cursor-pointer"
              />
            </div>
          </div>

          {/* Desktop: original two buttons */}
          <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-center">
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
          
          {/* Stats - horizontal row on mobile */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-4 md:pt-8">
            <motion.div
              className="flex flex-col items-center space-y-1 md:space-y-2 text-primary-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-9 h-9 md:w-12 md:h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">10K+</div>
              <div className="text-xs md:text-sm opacity-90">Properties</div>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-1 md:space-y-2 text-primary-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="w-9 h-9 md:w-12 md:h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">50K+</div>
              <div className="text-xs md:text-sm opacity-90">Customers</div>
            </div>
            <div className="flex flex-col items-center space-y-1 md:space-y-2 text-primary-foreground">
              <div className="w-9 h-9 md:w-12 md:h-12 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">15+</div>
              <div className="text-xs md:text-sm opacity-90">Years Exp.</div>
            </div>
          </div>
        </div>
        
        {/* Search Section */}
        <div className="mt-6 md:mt-12 animate-slide-up" ref={searchRef}>
          <SearchSection />
        </div>
      </div>

      <PhotoUpload open={showUpload} onOpenChange={setShowUpload} />
    </section>
  );
};
