import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarketAIInsightsProps {
  context: 'property_trends' | 'mortgage_calculator' | 'investment_tips';
  contextData?: Record<string, unknown>;
  className?: string;
}

const contextPrompts: Record<string, string> = {
  property_trends: `Analyze current Kenyan real estate market trends. Provide:
1. Current market conditions and price movements
2. Hot locations and emerging areas to watch
3. Investment opportunities and risks
4. Short-term and long-term market predictions
Keep the analysis focused on actionable insights for investors.`,
  
  mortgage_calculator: `Provide mortgage and financing insights for Kenyan property buyers. Include:
1. Current interest rate environment and trends
2. Tips for getting better mortgage rates
3. Alternative financing options available in Kenya
4. Advice on optimal loan structures and terms
Focus on practical financial guidance.`,
  
  investment_tips: `Share current real estate investment strategies for the Kenyan market. Cover:
1. Best investment strategies for current market conditions
2. Property types with highest ROI potential
3. Risk factors to watch out for
4. Tax considerations and benefits for property investors
Provide actionable, specific advice.`
};

const contextTitles: Record<string, string> = {
  property_trends: 'AI Market Analysis',
  mortgage_calculator: 'AI Financing Insights',
  investment_tips: 'AI Investment Advice'
};

export function MarketAIInsights({ context, contextData, className }: MarketAIInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      let prompt = contextPrompts[context];
      
      // Add context data if available (e.g., calculator values)
      if (contextData && Object.keys(contextData).length > 0) {
        prompt += `\n\nUser's current data for context: ${JSON.stringify(contextData)}`;
      }

      const { data, error } = await supabase.functions.invoke('market-ai-insights', {
        body: { 
          context,
          prompt,
          contextData
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('AI service is busy. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI service temporarily unavailable.');
        } else {
          toast.error('Failed to get AI insights. Please try again.');
        }
        throw error;
      }

      setInsights(data.insights);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('AI insights error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!insights) {
      fetchInsights();
    }
  };

  const handleRefresh = () => {
    fetchInsights();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        variant="outline"
        className={`gap-2 border-primary/50 hover:bg-primary/10 ${className}`}
      >
        <Sparkles className="w-4 h-4 text-primary" />
        Get AI Insights
      </Button>
    );
  }

  return (
    <Card className={`border-primary/30 bg-gradient-to-br from-primary/5 to-background ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            {contextTitles[context]}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Analyzing market data...</span>
          </div>
        ) : insights ? (
          <div className="prose prose-sm max-w-none text-foreground">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {insights}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Click refresh to get the latest AI insights
          </p>
        )}
      </CardContent>
    </Card>
  );
}
