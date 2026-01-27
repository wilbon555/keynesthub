import { Badge } from "@/components/ui/badge";
import { Flame, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketDemandBadgeProps {
  demandLevel?: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  daysToOffer?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MarketDemandBadge({ 
  demandLevel, 
  daysToOffer,
  size = 'sm',
  className 
}: MarketDemandBadgeProps) {
  if (!demandLevel && daysToOffer === undefined) return null;

  const config = {
    very_high: {
      label: 'Hot',
      bgClass: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30',
      textClass: 'text-red-600 dark:text-red-400',
      showFlame: true
    },
    high: {
      label: 'High Demand',
      bgClass: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
      textClass: 'text-orange-600 dark:text-orange-400',
      showFlame: true
    },
    moderate: {
      label: 'Moderate',
      bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
      textClass: 'text-blue-600 dark:text-blue-400',
      showFlame: false
    },
    low: {
      label: 'Low Demand',
      bgClass: 'bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30',
      textClass: 'text-slate-600 dark:text-slate-400',
      showFlame: false
    },
    very_low: {
      label: 'Very Low',
      bgClass: 'bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30',
      textClass: 'text-slate-500 dark:text-slate-500',
      showFlame: false
    }
  };

  const { label, bgClass, textClass, showFlame } = demandLevel 
    ? config[demandLevel] 
    : config.moderate;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        bgClass,
        textClass,
        sizeClasses[size],
        'font-medium border gap-1 cursor-default',
        className
      )}
      title={daysToOffer ? `Expected offer in ~${daysToOffer} days` : undefined}
    >
      <Sparkles className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
      )} />
      {showFlame ? (
        <Flame className={cn(
          size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        )} />
      ) : (
        <Clock className={cn(
          size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        )} />
      )}
      <span>{label}</span>
      {daysToOffer && <span className="opacity-75">~{daysToOffer}d</span>}
    </Badge>
  );
}
