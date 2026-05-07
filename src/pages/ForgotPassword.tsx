import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Forgot Password | KeyNestHub";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { email: validEmail } = schema.parse({ email });
      setLoading(true);
      // Always show success regardless of whether email exists (avoid enumeration)
      await supabase.auth.resetPasswordForEmail(validEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ variant: "destructive", title: "Invalid email", description: err.errors[0].message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/auth")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <Alert>
                <MailCheck className="h-4 w-4" />
                <AlertDescription>
                  If an account exists, a reset link has been sent. Check your inbox (and spam folder).
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-card"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/auth" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;