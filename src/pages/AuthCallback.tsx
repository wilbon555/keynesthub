import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Intercept auth hash tokens arriving from Zoho email redirection links
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          toast({
            title: "Account Verified!",
            description: "Welcome to KeyNestHub. Your session is now secure.",
          });
          navigate("/Dashboard"); // Matches your Dashboard.tsx asset name capitalizations
        } else if (event === "PASSWORD_RECOVERY") {
          toast({
            title: "Identity Authenticated",
            description: "Please supply your new secure password configuration below.",
          });
          navigate("/ResetPassword"); // Redirects to your existing ResetPassword.tsx path
        }
      }
    );

    // Backup navigation route if authentication fails to resolve
    const routeTimeout = setTimeout(() => {
      navigate("/Auth"); 
    }, 4500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(routeTimeout);
    };
  }, [navigate, toast]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <h2 className="text-xl font-semibold text-slate-800">Verifying your account...</h2>
        <p className="text-sm text-slate-500">Securing your session with KeyNestHub.</p>
      </div>
    </div>
  );
}
