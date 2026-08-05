import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const welcomeKey = (id: string) => `keynesthub_welcome_sent_${id}`;

/**
 * Keeps a newly confirmed user's profile in sync with their signup metadata
 * and sends the one-time welcome email once their address is confirmed.
 */
export const useOnboardingSync = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    const confirmed = user.email_confirmed_at || (user as any).confirmed_at;
    if (!confirmed) return;
    if (handled.current === user.id) return;
    handled.current = user.id;

    const meta = (user.user_metadata || {}) as Record<string, string>;
    const fullName =
      meta.full_name ||
      [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
      user.email?.split("@")[0] ||
      "there";

    (async () => {
      try {
        // 1. Make sure a profile row exists and mirrors the signup details.
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        const patch: Record<string, string> = {};
        if (!profile?.full_name && fullName) patch.full_name = fullName;
        if (!profile?.phone && meta.phone) patch.phone = meta.phone;

        if (!profile) {
          await supabase.from("profiles").insert({ id: user.id, ...patch });
        } else if (Object.keys(patch).length > 0) {
          await supabase.from("profiles").update(patch).eq("id", user.id);
        }

        // 2. Send the welcome email exactly once per user.
        if (localStorage.getItem(welcomeKey(user.id))) return;
        localStorage.setItem(welcomeKey(user.id), "1");

        const { error } = await supabase.functions.invoke("send-welcome-email", {
          body: { userId: user.id, email: user.email, fullName },
        });

        if (error) {
          console.error("Welcome email failed:", error);
          localStorage.removeItem(welcomeKey(user.id));
          return;
        }

        toast({
          title: "Email confirmed",
          description: "Your account is verified. We've sent a welcome email with next steps.",
        });
      } catch (err) {
        console.error("Onboarding sync failed:", err);
      }
    })();
  }, [user, loading, toast]);
};
