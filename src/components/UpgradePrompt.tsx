import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SubscriptionTier } from "@/hooks/useSubscription";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: SubscriptionTier;
  reason: string;
}

const tierInfo: Record<string, { icon: React.ReactNode; price: string; name: string }> = {
  premium: { icon: <Star className="w-5 h-5" />, price: "$29/mo", name: "Premium" },
  professional: { icon: <Crown className="w-5 h-5" />, price: "$59/mo", name: "Professional" },
};

export const UpgradePrompt = ({ open, onOpenChange, currentTier, reason }: UpgradePromptProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {currentTier === "basic" && (
            <div className="border border-primary rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Premium</span>
                </div>
                <Badge variant="secondary">$29/mo</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary" /> Up to 20 photos</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary" /> 90-day listing duration</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary" /> Featured in search results</li>
              </ul>
              <Button className="w-full" onClick={() => { onOpenChange(false); navigate("/sell/pricing-plans"); }}>
                Upgrade to Premium
              </Button>
            </div>
          )}

          {(currentTier === "basic" || currentTier === "premium") && (
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Professional</span>
                </div>
                <Badge variant="secondary">$59/mo</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary" /> Unlimited photos</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary" /> Unlimited listing duration</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary" /> Top placement & analytics</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => { onOpenChange(false); navigate("/sell/pricing-plans"); }}>
                Go Professional
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
