import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseHealth } from "@/hooks/useSupabaseHealth";

export const ServiceStatusBanner = () => {
  const { status, recheck } = useSupabaseHealth();

  if (status === 'online') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="container mx-auto px-4 mt-4"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/40 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/40 px-4 py-3 text-sm">
        <div className="flex items-center gap-3 text-amber-900 dark:text-amber-100">
          {status === 'checking' ? (
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>
            {status === 'checking'
              ? 'Checking service status…'
              : 'We’re having trouble reaching our servers. Some listings may be unavailable.'}
          </span>
        </div>
        {status === 'offline' && (
          <Button size="sm" variant="outline" onClick={recheck} className="flex-shrink-0">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};