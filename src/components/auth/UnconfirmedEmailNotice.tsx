import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, MailWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Props {
  variant?: "page" | "banner";
}

export const UnconfirmedEmailNotice = ({ variant = "page" }: Props) => {
  const { user, signOut } = useAuth();
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const email = user?.email || "";

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setResending(false);
    if (error) {
      toast.error(error.message || "Couldn't resend confirmation email.");
    } else {
      toast.success(`Verification link sent to ${email}.`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  if (variant === "banner") {
    return (
      <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-sm flex flex-wrap items-center justify-center gap-3">
        <MailWarning className="w-4 h-4 text-amber-600" />
        <span className="text-foreground">
          Please verify your email <span className="font-medium">{email}</span> to unlock all features.
        </span>
        <Button size="sm" variant="outline" onClick={handleResend} disabled={resending}>
          {resending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
          Resend email
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <Alert>
        <MailWarning className="w-4 h-4" />
        <AlertTitle>Confirm your email to continue</AlertTitle>
        <AlertDescription className="space-y-3 mt-2">
          <p>
            We sent a verification link to <span className="font-medium">{email}</span>.
            Please click it to activate your account. This page will unlock automatically once
            confirmation is detected.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleResend} disabled={resending}>
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend confirmation email"
              )}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Use a different account
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
