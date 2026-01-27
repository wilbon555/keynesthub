import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestmentScoreBadgeProps {
  score?: number;
  grade?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function InvestmentScoreBadge({ 
  score, 
  grade,
  size = 'sm',
  showLabel = true,
  className 
}: InvestmentScoreBadgeProps) {
  if (score === undefined && !grade) return null;

  const getColorByScore = (s: number) => {
    if (s >= 80) return {
      bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
      textClass: 'text-emerald-600 dark:text-emerald-400'
    };
    if (s >= 60) return {
      bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
      textClass: 'text-blue-600 dark:text-blue-400'
    };
    if (s >= 40) return {
      bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
      textClass: 'text-amber-600 dark:text-amber-400'
    };
    return {
      bgClass: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30',
      textClass: 'text-red-600 dark:text-red-400'
    };
  };

  const colors = getColorByScore(score ?? 50);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        colors.bgClass,
        colors.textClass,
        sizeClasses[size],
        'font-medium border gap-1 cursor-default',
        className
      )}
      title={`Investment Score: ${score}/100${grade ? ` (Grade: ${grade})` : ''}`}
    >
      <Sparkles className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
      )} />
      <TrendingUp className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
      )} />
      {showLabel && <span>{grade || `${score}%`}</span>}
    </Badge>
  );
}
