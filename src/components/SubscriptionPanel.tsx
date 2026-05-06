import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Check, Zap, Headphones, Image as ImageIcon, CalendarDays, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";

export const SubscriptionPanel = () => {
  const navigate = useNavigate();
  const { tier, limits, loading, getUpgradeTier, TIER_LIMITS } = useSubscription();
  const { properties } = useProperties();
  const { user } = useAuth();

  const isPro = tier !== "basic";
  const upgradeTier = getUpgradeTier();
  const myListings = properties.filter((p) => p.user_id === user?.id).length;
  const photoUsagePct = Math.min(100, (myListings / Math.max(1, limits.maxPhotos)) * 100);

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="py-10 text-center text-muted-foreground text-sm">
          Loading your plan…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Current plan status */}
      <Card className={isPro ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent" : "border-border"}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg capitalize">{isPro ? `${tier} (Pro)` : "Free"} plan</CardTitle>
              {isPro ? (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" /> PRO
                </Badge>
              ) : (
                <Badge variant="secondary">FREE</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isPro
                ? "Enjoy higher limits and priority support."
                : "Upgrade to unlock higher limits and priority support."}
            </p>
          </div>
          {!isPro && (
            <Button onClick={() => navigate("/sell/pricing-plans")} className="shrink-0">
              <Zap className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Limits */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ImageIcon className="w-4 h-4" /> Photos per listing
                </span>
                <span className="font-semibold">{limits.maxPhotos}</span>
              </div>
              <Progress value={photoUsagePct} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-2">{myListings} active listings</p>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="w-4 h-4" /> Listing duration
                </span>
                <span className="font-semibold">{limits.listingDurationDays} days</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <Headphones className="w-3.5 h-3.5" />
                {isPro ? "Priority support included" : "Standard support"}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> What's included
            </h4>
            <ul className="grid sm:grid-cols-2 gap-2">
              {limits.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade preview */}
      {upgradeTier && (
        <Card className="border-dashed border-primary/40">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base capitalize flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Upgrade to {upgradeTier}
              </CardTitle>
              <Button size="sm" onClick={() => navigate("/sell/pricing-plans")}>
                See pricing
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="grid sm:grid-cols-2 gap-2">
              {TIER_LIMITS[upgradeTier].features
                .filter((f) => !limits.features.includes(f))
                .map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Up to {TIER_LIMITS[upgradeTier].maxPhotos} photos per listing
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                {TIER_LIMITS[upgradeTier].listingDurationDays}-day listing duration
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};