import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const redirect = searchParams.get("redirect");
      navigate(redirect ? decodeURIComponent(redirect) : "/");
    }
  }, [user, navigate, searchParams]);

  const handleSignUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await signUp(email, password);
    return { error };
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-elegant">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Welcome to KeyNestHub</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <SignInForm onSignIn={signIn} isLoading={isLoading} setIsLoading={setIsLoading} />
              </TabsContent>

              <TabsContent value="signup">
                <SignUpForm onSignUp={handleSignUp} isLoading={isLoading} setIsLoading={setIsLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
