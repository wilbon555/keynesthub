import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyData {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  listing_type: string;
  description?: string;
}

interface MarketContext {
  averagePrice?: number;
  similarProperties?: PropertyData[];
  locationTrend?: 'rising' | 'stable' | 'declining';
}

interface AIRequest {
  action: 'price_analysis' | 'investment_score' | 'market_prediction' | 'seller_advice' | 'comprehensive';
  property: PropertyData;
  marketContext?: MarketContext;
  userPreferences?: {
    budget?: number;
    investmentGoals?: string;
    timeline?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, property, marketContext, userPreferences } = await req.json() as AIRequest;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Processing AI request: ${action} for property: ${property.title}`);

    // Parse price to number for calculations
    const priceValue = parseFloat(property.price.replace(/[^0-9.]/g, ''));
    const areaValue = parseFloat(property.area.replace(/[^0-9.]/g, ''));
    const pricePerSqFt = areaValue > 0 ? priceValue / areaValue : 0;

    // Build the system prompt based on action
    const systemPrompt = buildSystemPrompt(action);
    const userPrompt = buildUserPrompt(action, property, marketContext, userPreferences, priceValue, pricePerSqFt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: getToolsForAction(action),
        tool_choice: { type: 'function', function: { name: getToolNameForAction(action) } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    console.log('AI response received successfully');

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback to content if no tool call
    const content = data.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ rawContent: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Property AI insights error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildSystemPrompt(action: string): string {
  const basePrompt = `You are an expert real estate analyst specializing in the Kenyan property market. 
You provide data-driven insights based on market conditions, location analysis, and property characteristics.
Always be specific, actionable, and honest about uncertainties. Use Kenyan Shillings (KES) for all monetary values.
Consider factors like location desirability, infrastructure, security, proximity to amenities, and market trends.`;

  switch (action) {
    case 'price_analysis':
      return `${basePrompt}
Focus on price fairness analysis. Compare properties to market averages and similar listings.
Consider the Kenyan real estate market dynamics, including areas like Nairobi, Mombasa, Kisumu, and their suburbs.`;
    
    case 'investment_score':
      return `${basePrompt}
Focus on investment potential. Analyze ROI, rental yield, appreciation potential, and risks.
Consider the Kenyan rental market, vacancy rates, and economic factors.`;
    
    case 'market_prediction':
      return `${basePrompt}
Focus on market predictions. Analyze demand trends, buyer interest patterns, and timing.
Consider seasonal patterns in the Kenyan real estate market.`;
    
    case 'seller_advice':
      return `${basePrompt}
Focus on seller optimization. Provide pricing strategies and timing recommendations.
Consider the best times to list in the Kenyan market.`;
    
    default:
      return `${basePrompt}
Provide comprehensive analysis covering price fairness, investment potential, and market predictions.`;
  }
}

function buildUserPrompt(
  action: string, 
  property: PropertyData, 
  marketContext?: MarketContext,
  userPreferences?: any,
  priceValue?: number,
  pricePerSqFt?: number
): string {
  const propertyDetails = `
Property Details:
- Title: ${property.title}
- Price: ${property.price}
- Location: ${property.location}
- Type: ${property.type}
- Bedrooms: ${property.bedrooms || 'N/A'}
- Bathrooms: ${property.bathrooms || 'N/A'}
- Area: ${property.area}
- Listing Type: ${property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
- Description: ${property.description || 'No description provided'}
${pricePerSqFt ? `- Price per sq ft: KES ${pricePerSqFt.toLocaleString()}` : ''}`;

  const marketInfo = marketContext ? `
Market Context:
- Average area price: ${marketContext.averagePrice ? `KES ${marketContext.averagePrice.toLocaleString()}` : 'Unknown'}
- Location trend: ${marketContext.locationTrend || 'Unknown'}
- Similar properties: ${marketContext.similarProperties?.length || 0} found` : '';

  switch (action) {
    case 'price_analysis':
      return `${propertyDetails}${marketInfo}

Analyze this property's price fairness. Determine if it's overpriced, fairly priced, or undervalued compared to the market.`;

    case 'investment_score':
      return `${propertyDetails}${marketInfo}

Analyze this property's investment potential. Calculate estimated ROI, rental yield, and assess risks.
${userPreferences?.investmentGoals ? `User's investment goals: ${userPreferences.investmentGoals}` : ''}`;

    case 'market_prediction':
      return `${propertyDetails}${marketInfo}

Predict market dynamics for this property. Estimate days to offer, demand level, and optimal listing timing.`;

    case 'seller_advice':
      return `${propertyDetails}${marketInfo}

Provide seller advice. Suggest optimal pricing strategy and best time to list for maximum return.`;

    default:
      return `${propertyDetails}${marketInfo}

Provide comprehensive analysis including price fairness, investment potential, market predictions, and seller advice if applicable.`;
  }
}

function getToolNameForAction(action: string): string {
  switch (action) {
    case 'price_analysis': return 'analyze_price';
    case 'investment_score': return 'score_investment';
    case 'market_prediction': return 'predict_market';
    case 'seller_advice': return 'advise_seller';
    default: return 'comprehensive_analysis';
  }
}

function getToolsForAction(action: string) {
  const tools: any[] = [];

  if (action === 'price_analysis' || action === 'comprehensive') {
    tools.push({
      type: 'function',
      function: {
        name: 'analyze_price',
        description: 'Analyze property price fairness',
        parameters: {
          type: 'object',
          properties: {
            fairnessRating: { 
              type: 'string', 
              enum: ['undervalued', 'fair', 'overpriced'],
              description: 'Overall price fairness rating'
            },
            fairnessScore: { 
              type: 'number', 
              description: 'Score from 0-100, where 50 is fair market value, <50 is overpriced, >50 is undervalued'
            },
            estimatedMarketValue: {
              type: 'string',
              description: 'Estimated fair market value in KES'
            },
            priceDifference: {
              type: 'string',
              description: 'Difference from market value (e.g., "+15%" or "-10%")'
            },
            confidence: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Confidence level in the analysis'
            },
            reasoning: {
              type: 'string',
              description: 'Brief explanation of the price analysis'
            },
            comparables: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  priceRange: { type: 'string' }
                }
              },
              description: 'Similar properties for comparison'
            }
          },
          required: ['fairnessRating', 'fairnessScore', 'estimatedMarketValue', 'confidence', 'reasoning']
        }
      }
    });
  }

  if (action === 'investment_score' || action === 'comprehensive') {
    tools.push({
      type: 'function',
      function: {
        name: 'score_investment',
        description: 'Score property investment potential',
        parameters: {
          type: 'object',
          properties: {
            overallScore: { 
              type: 'number', 
              description: 'Investment score from 0-100'
            },
            grade: {
              type: 'string',
              enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
              description: 'Investment grade'
            },
            estimatedROI: {
              type: 'string',
              description: 'Estimated annual ROI percentage'
            },
            rentalYield: {
              type: 'string',
              description: 'Estimated gross rental yield percentage'
            },
            estimatedMonthlyRent: {
              type: 'string',
              description: 'Estimated monthly rental income in KES'
            },
            vacancyRisk: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Risk of extended vacancy'
            },
            appreciationPotential: {
              type: 'string',
              enum: ['high', 'moderate', 'low', 'declining'],
              description: 'Expected property value appreciation'
            },
            strengths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key investment strengths'
            },
            risks: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key investment risks'
            },
            recommendation: {
              type: 'string',
              description: 'Investment recommendation summary'
            }
          },
          required: ['overallScore', 'grade', 'estimatedROI', 'rentalYield', 'vacancyRisk', 'appreciationPotential', 'recommendation']
        }
      }
    });
  }

  if (action === 'market_prediction' || action === 'comprehensive') {
    tools.push({
      type: 'function',
      function: {
        name: 'predict_market',
        description: 'Predict market dynamics for the property',
        parameters: {
          type: 'object',
          properties: {
            demandLevel: {
              type: 'string',
              enum: ['very_high', 'high', 'moderate', 'low', 'very_low'],
              description: 'Current demand level for this type of property'
            },
            estimatedDaysToOffer: {
              type: 'number',
              description: 'Estimated days until receiving an offer'
            },
            offerLikelihood: {
              type: 'string',
              description: 'Likelihood of receiving an offer within 30 days'
            },
            buyerCompetition: {
              type: 'string',
              enum: ['high', 'moderate', 'low'],
              description: 'Level of buyer competition'
            },
            seasonalTrend: {
              type: 'string',
              description: 'Current seasonal market trend'
            },
            priceMovementPrediction: {
              type: 'string',
              enum: ['increasing', 'stable', 'decreasing'],
              description: 'Expected price movement in next 6 months'
            },
            urgencyAdvice: {
              type: 'string',
              description: 'Advice on timing for buyers/sellers'
            },
            marketInsights: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key market insights'
            }
          },
          required: ['demandLevel', 'estimatedDaysToOffer', 'offerLikelihood', 'priceMovementPrediction', 'urgencyAdvice']
        }
      }
    });
  }

  if (action === 'seller_advice' || action === 'comprehensive') {
    tools.push({
      type: 'function',
      function: {
        name: 'advise_seller',
        description: 'Provide seller advice and pricing strategy',
        parameters: {
          type: 'object',
          properties: {
            suggestedPrice: {
              type: 'string',
              description: 'Suggested listing price in KES'
            },
            priceRange: {
              type: 'object',
              properties: {
                low: { type: 'string' },
                high: { type: 'string' }
              },
              description: 'Recommended price range'
            },
            pricingStrategy: {
              type: 'string',
              enum: ['aggressive', 'competitive', 'premium'],
              description: 'Recommended pricing strategy'
            },
            bestTimeToList: {
              type: 'string',
              description: 'Best time/season to list the property'
            },
            currentTimingScore: {
              type: 'number',
              description: 'Score from 0-100 for current listing timing'
            },
            improvementSuggestions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Suggestions to improve listing appeal'
            },
            targetBuyerProfile: {
              type: 'string',
              description: 'Description of ideal buyer for this property'
            },
            sellerTips: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tips for sellers to maximize sale'
            }
          },
          required: ['suggestedPrice', 'priceRange', 'pricingStrategy', 'bestTimeToList', 'currentTimingScore']
        }
      }
    });
  }

  if (action === 'comprehensive') {
    return [{
      type: 'function',
      function: {
        name: 'comprehensive_analysis',
        description: 'Provide comprehensive property analysis',
        parameters: {
          type: 'object',
          properties: {
            priceAnalysis: {
              type: 'object',
              properties: {
                fairnessRating: { type: 'string', enum: ['undervalued', 'fair', 'overpriced'] },
                fairnessScore: { type: 'number' },
                estimatedMarketValue: { type: 'string' },
                priceDifference: { type: 'string' },
                reasoning: { type: 'string' }
              },
              required: ['fairnessRating', 'fairnessScore', 'estimatedMarketValue', 'reasoning']
            },
            investmentScore: {
              type: 'object',
              properties: {
                overallScore: { type: 'number' },
                grade: { type: 'string' },
                estimatedROI: { type: 'string' },
                rentalYield: { type: 'string' },
                estimatedMonthlyRent: { type: 'string' },
                vacancyRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
                appreciationPotential: { type: 'string', enum: ['high', 'moderate', 'low', 'declining'] },
                strengths: { type: 'array', items: { type: 'string' } },
                risks: { type: 'array', items: { type: 'string' } }
              },
              required: ['overallScore', 'grade', 'estimatedROI', 'rentalYield', 'vacancyRisk']
            },
            marketPrediction: {
              type: 'object',
              properties: {
                demandLevel: { type: 'string', enum: ['very_high', 'high', 'moderate', 'low', 'very_low'] },
                estimatedDaysToOffer: { type: 'number' },
                offerLikelihood: { type: 'string' },
                priceMovementPrediction: { type: 'string', enum: ['increasing', 'stable', 'decreasing'] },
                urgencyAdvice: { type: 'string' },
                marketInsights: { type: 'array', items: { type: 'string' } }
              },
              required: ['demandLevel', 'estimatedDaysToOffer', 'priceMovementPrediction']
            },
            sellerAdvice: {
              type: 'object',
              properties: {
                suggestedPrice: { type: 'string' },
                pricingStrategy: { type: 'string', enum: ['aggressive', 'competitive', 'premium'] },
                bestTimeToList: { type: 'string' },
                currentTimingScore: { type: 'number' },
                improvementSuggestions: { type: 'array', items: { type: 'string' } }
              },
              required: ['suggestedPrice', 'pricingStrategy', 'bestTimeToList', 'currentTimingScore']
            },
            summary: {
              type: 'string',
              description: 'Executive summary of the analysis'
            }
          },
          required: ['priceAnalysis', 'investmentScore', 'marketPrediction', 'summary']
        }
      }
    }];
  }

  return tools;
}
