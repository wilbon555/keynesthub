import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, Clock, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VerificationDetail {
  titleDeedVerified?: boolean;
  taxesPaidVerified?: boolean;
  physicalInspectionDone?: boolean;
}

interface VerificationBadgeProps {
  status: string;
  className?: string;
  details?: VerificationDetail;
}

export const VerificationBadge = ({ status, className = '', details }: VerificationBadgeProps) => {
  if (status === 'verified') {
    const checksCompleted = [
      details?.titleDeedVerified,
      details?.taxesPaidVerified,
      details?.physicalInspectionDone,
    ].filter(Boolean).length;
    const isFullyVerified = checksCompleted === 3;

    const items = [
      { label: 'Title Deed Verified', checked: details?.titleDeedVerified ?? false },
      { label: 'Taxes Paid', checked: details?.taxesPaidVerified ?? false },
      { label: 'Physical Inspection', checked: details?.physicalInspectionDone ?? false },
    ];

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <Badge
            className={`cursor-pointer hover:opacity-80 transition-colors ${
              isFullyVerified
                ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 hover:bg-green-500/30'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
            } ${className}`}
          >
            {isFullyVerified ? (
              <ShieldCheck className="w-3 h-3 mr-1" />
            ) : (
              <ShieldAlert className="w-3 h-3 mr-1" />
            )}
            {isFullyVerified ? 'Fully Verified' : `Verified (${checksCompleted}/3)`}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 p-3 z-[100]"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Verification Details
          </p>
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <Checkbox checked={item.checked} disabled className="pointer-events-none" />
                <span className={`text-sm ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
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
