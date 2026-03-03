import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Clock, FileCheck, Landmark, Eye, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VerificationBadgeProps {
  status: string;
  className?: string;
}

const VerificationDetails = () => (
  <div className="space-y-2 p-1">
    <p className="text-xs font-semibold text-foreground mb-2">Verification Details</p>
    {[
      { icon: FileCheck, label: "Title Deed Verified", color: "text-green-600 dark:text-green-400" },
      { icon: Landmark, label: "Taxes Paid", color: "text-green-600 dark:text-green-400" },
      { icon: Eye, label: "Physical Inspection Completed", color: "text-green-600 dark:text-green-400" },
    ].map(({ icon: Icon, label, color }) => (
      <div key={label} className="flex items-center gap-2 text-xs">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-muted-foreground">{label}</span>
      </div>
    ))}
  </div>
);

export const VerificationBadge = ({ status, className = '' }: VerificationBadgeProps) => {
  if (status === 'verified') {
    return (
      <Popover>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Badge 
            className={`bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 cursor-pointer ${className}`}
          >
            <ShieldCheck className="w-3 h-3 mr-1" />
            Verified
            <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start" onClick={(e) => e.stopPropagation()}>
          <VerificationDetails />
        </PopoverContent>
      </Popover>
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
