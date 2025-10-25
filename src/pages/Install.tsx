import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Install App | KeyNestHub";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Install KeyNestHub on Your Phone
            </h1>
            <p className="text-lg text-muted-foreground">
              Get quick access to KeyNestHub right from your home screen
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  iPhone (iOS)
                </CardTitle>
                <CardDescription>Follow these steps to install</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap the <strong>Share</strong> button at the bottom of Safari
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap <strong>"Add"</strong> to confirm
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Android
                </CardTitle>
                <CardDescription>Follow these steps to install</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap the <strong>menu icon</strong> (three dots) in your browser
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap <strong>"Install"</strong> to confirm
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Home className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Benefits of Installing</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Quick access from your home screen</li>
                    <li>✓ Works offline for faster loading</li>
                    <li>✓ Full-screen experience without browser bars</li>
                    <li>✓ Receive notifications about new properties</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button onClick={() => navigate("/")} variant="outline" size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Install;
