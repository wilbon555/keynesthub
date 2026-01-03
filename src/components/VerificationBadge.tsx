import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Clock } from "lucide-react";

interface VerificationBadgeProps {
  status: string;
  className?: string;
}

export const VerificationBadge = ({ status, className = '' }: VerificationBadgeProps) => {
  if (status === 'verified') {
    return (
      <Badge 
        className={`bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 ${className}`}
      >
        <ShieldCheck className="w-3 h-3 mr-1" />
        Verified Listing
      </Badge>
    );
  }

  if (status === 'pending') {
    return (
      <Badge 
        variant="secondary"
        className={`bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 ${className}`}
      >
        <Clock className="w-3 h-3 mr-1" />
        Pending Verification
      </Badge>
    );
  }

  if (status === 'rejected') {
    return (
      <Badge 
        variant="destructive"
        className={className}
      >
        <Shield className="w-3 h-3 mr-1" />
        Verification Failed
      </Badge>
    );
  }

  return null;
};

export const AgentVerifiedBadge = ({ className = '' }: { className?: string }) => {
  return (
    <Badge 
      className={`bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 ${className}`}
    >
      <ShieldCheck className="w-3 h-3 mr-1" />
      Agent Verified Owner
    </Badge>
  );
};
