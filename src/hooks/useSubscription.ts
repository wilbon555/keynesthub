import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubscriptionTier = "basic" | "premium" | "professional";

interface SubscriptionLimits {
  maxPhotos: number;
  listingDurationDays: number;
  features: string[];
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  basic: {
    maxPhotos: 5,
    listingDurationDays: 30,
    features: ["Basic property details", "Contact form inquiries"],
  },
  premium: {
    maxPhotos: 20,
    listingDurationDays: 90,
    features: [
      "Featured in search results",
      "Virtual tour support",
      "Priority customer support",
      "Performance analytics",
    ],
  },
  professional: {
    maxPhotos: 100,
    listingDurationDays: 365,
    features: [
      "Top placement in results",
      "Multiple virtual tours",
      "Unlimited duration",
      "Dedicated account manager",
      "Advanced analytics dashboard",
      "Marketing boost campaigns",
    ],
  },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("basic");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier("basic");
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setTier(data.tier as SubscriptionTier);
      } else {
        // Auto-create basic subscription for new users
        await supabase.from("user_subscriptions").insert({
          user_id: user.id,
          tier: "basic",
        });
        setTier("basic");
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const limits = TIER_LIMITS[tier];

  const canUploadMore = (currentCount: number) => currentCount < limits.maxPhotos;

  const getUpgradeTier = (): SubscriptionTier | null => {
    if (tier === "basic") return "premium";
    if (tier === "premium") return "professional";
    return null;
  };

  return {
    tier,
    limits,
    loading,
    canUploadMore,
    getUpgradeTier,
    TIER_LIMITS,
  };
};
