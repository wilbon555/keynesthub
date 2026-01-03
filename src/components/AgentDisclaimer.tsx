import { Shield } from "lucide-react";

interface AgentDisclaimerProps {
  className?: string;
}

export const AgentDisclaimer = ({ className = '' }: AgentDisclaimerProps) => {
  return (
    <div className={`bg-primary/5 border border-primary/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Buyer Protection Active
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            All inquiries are handled through KeyNestHub agents to protect buyers from fraud. 
            Our agents verify property ownership and legitimacy before connecting you with the owner.
          </p>
        </div>
      </div>
    </div>
  );
};
