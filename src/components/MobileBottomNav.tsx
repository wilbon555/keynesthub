import { Home, Search, Building2, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/discover" },
  { icon: Building2, label: "Listings", path: "/buy/residential" },
  { icon: User, label: "Profile", path: "/dashboard" },
];

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNav = (path: string) => {
    if (path === "/dashboard" && !user) {
      navigate("/auth");
    } else {
      navigate(path);
    }
  };

  return (
    <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || (
            path === "/dashboard" && location.pathname === "/landlord-dashboard"
          );
          return (
            <Button
              key={path}
              onClick={() => handleNav(path)}
              variant="ghost"
              size="sm"
              aria-current={isActive ? "page" : undefined}
              className={`h-full flex-col justify-center gap-0.5 flex-1 min-h-[48px] px-0 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
