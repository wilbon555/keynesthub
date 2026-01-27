import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceFairnessBadgeProps {
  rating?: 'undervalued' | 'fair' | 'overpriced';
  score?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceFairnessBadge({ 
  rating, 
  score, 
  showLabel = true,
  size = 'sm',
  className 
}: PriceFairnessBadgeProps) {
  if (!rating) return null;

  const config = {
    undervalued: {
      label: 'Undervalued',
      icon: TrendingDown,
      bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      description: 'Below market value'
    },
    fair: {
      label: 'Fair Price',
      icon: Minus,
      bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
      textClass: 'text-blue-600 dark:text-blue-400',
      description: 'At market value'
    },
    overpriced: {
      label: 'Overpriced',
      icon: TrendingUp,
      bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
      textClass: 'text-amber-600 dark:text-amber-400',
      description: 'Above market value'
    }
  };

  const { label, icon: Icon, bgClass, textClass, description } = config[rating];

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
      title={`${description}${score ? ` (Score: ${score}/100)` : ''}`}
    >
      <Sparkles className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
      )} />
      <Icon className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
      )} />
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}
