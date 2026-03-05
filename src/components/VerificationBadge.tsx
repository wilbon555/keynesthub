import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, Clock, CheckCircle2, Circle, FileCheck, Landmark, ClipboardCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

const VerificationChecklist = ({ details }: { details?: VerificationDetail }) => {
  const items = [
    { label: 'Title Deed Verified', checked: details?.titleDeedVerified ?? false, icon: FileCheck },
    { label: 'Taxes Paid', checked: details?.taxesPaidVerified ?? false, icon: Landmark },
    { label: 'Physical Inspection Completed', checked: details?.physicalInspectionDone ?? false, icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-2.5 p-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verification Details</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5">
          {item.checked ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
          )}
          <item.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className={`text-sm ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export const VerificationBadge = ({ status, className = '', details }: VerificationBadgeProps) => {
  if (status === 'verified') {
    const checksCompleted = [
      details?.titleDeedVerified,
      details?.taxesPaidVerified,
      details?.physicalInspectionDone,
    ].filter(Boolean).length;
    const isFullyVerified = checksCompleted === 3;

    return (
      <Popover>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
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
          </Badge>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64" 
          align="start" 
          onClick={(e) => e.stopPropagation()}
        >
          <VerificationChecklist details={details} />
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
