import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required"),
});

interface SignInFormProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-foreground mb-1.5">
    {children} <span className="text-destructive">*</span>
  </label>
);

const SignInForm = ({ onSignIn, isLoading, setIsLoading }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUnconfirmed(false);

    try {
      const validated = signInSchema.parse({ email, password });
      const { error } = await onSignIn(validated.email, validated.password);

      if (error) {
        const msg = (error.message || "").toLowerCase();
        const isUnconfirmed =
          msg.includes("not confirmed") ||
          msg.includes("email not confirmed") ||
          (error as any)?.code === "email_not_confirmed";
        if (isUnconfirmed) {
          setUnconfirmed(true);
        }
        toast({ variant: "destructive", title: "Sign In Failed", description: error.message });
      } else {
        toast({ title: "Welcome back!", description: "You have successfully signed in." });
        const redirect = searchParams.get("redirect");
        navigate(redirect ? decodeURIComponent(redirect) : "/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ variant: "destructive", title: "Validation Error", description: error.errors[0].message });
      }
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Email required", description: "Enter your email above first." });
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setResending(false);
    if (error) {
      toast({ variant: "destructive", title: "Couldn't resend", description: error.message });
    } else {
      toast({ title: "Confirmation sent", description: `We've resent a verification link to ${email}.` });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {unconfirmed && (
        <Alert variant="destructive">
          <AlertTitle>Email not confirmed</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>You need to verify your email before signing in.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend confirmation email"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div>
        <RequiredLabel>Email Address</RequiredLabel>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 border-input bg-card"
          required
        />
      </div>

      <div>
        <RequiredLabel>Password</RequiredLabel>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10 border-input bg-card"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:underline font-medium"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
};

export default SignInForm;
