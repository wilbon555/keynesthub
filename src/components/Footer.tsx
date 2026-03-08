import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import keyNestHubLogo from "@/assets/keynesthub-logo.png";

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendWelcomeEmail = async (subscriberEmail: string) => {
    try {
      await supabase.functions.invoke("send-newsletter-welcome", {
        body: { email: subscriberEmail },
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed to our newsletter!");
        } else {
          throw error;
        }
      } else {
        toast.success("Thank you for subscribing to our newsletter!");
        sendWelcomeEmail(email.trim());
      }
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Buy Property", path: "/buy/residential" },
    { label: "Rent Property", path: "/rent/apartments" },
    { label: "List Property", path: "/sell/list-property" },
    { label: "Find Agent", path: "/agents/find-agent" },
    { label: "About Us", path: "/about" },
  ];

  const resources = [
    { label: "Investment Tips", path: "/investment-tips" },
    { label: "Mortgage Calculator", path: "/mortgage-calculator" },
    { label: "Property Trends", path: "/market/property-trends" },
    { label: "Neighborhood Guides", path: "/neighborhoods" },
    { label: "Become an Agent", path: "/become-agent" },
    { label: "Pricing Plans", path: "/sell/pricing-plans" },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img 
                src={keyNestHubLogo} 
                alt="KeyNestHub Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold">KeyNestHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted partner in finding the perfect property. We connect buyers, sellers, and agents across the region.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="mailto:keynesthub@gmail.com" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                keynesthub@gmail.com
              </a>
              <a 
                href="tel:+254701555240" 
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                +254 701 555 240
              </a>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                Nairobi, Kenya
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-2">Subscribe to Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm"
                  required
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="shrink-0" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} KeyNestHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
