import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchFilters {
  propertyType?: string;
  listingType?: 'sale' | 'rent';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  features?: string[];
  investmentCriteria?: string;
}

interface SearchResult {
  filters: SearchFilters;
  reasoning: string;
  suggestions?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, properties } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Processing smart search query: ${query}`);

    const systemPrompt = `You are an expert Kenyan real estate search assistant. Parse natural language property search queries and extract structured search filters.

You understand Kenyan locations (Nairobi, Westlands, Karen, Kilimani, Mombasa, Kisumu, etc.), local price ranges in Kenyan Shillings (KES), and property terminology.

Price context for Kenya:
- Budget properties: Under KES 5M
- Mid-range: KES 5M - 20M
- Premium: KES 20M - 50M
- Luxury: Above KES 50M
- Rental apartments: KES 15K - 150K/month
- Rental houses: KES 50K - 500K/month

Common areas and their characteristics:
- Karen, Muthaiga, Runda: Luxury, large plots, secure
- Westlands, Kilimani: Urban, apartments, mid to high-end
- Lavington, Kileleshwa: Family-friendly, good schools nearby
- South B, South C: Affordable, growing areas
- Syokimau, Athi River: Affordable, upcoming areas
- Coast (Nyali, Diani): Beach properties, tourism

Understand investment language:
- "growth potential" = areas with infrastructure development
- "good ROI" = rental income potential
- "appreciating" = areas with rising property values`;

    const userPrompt = `Parse this property search query and extract filters:

"${query}"

Extract:
1. Property type (land, apartment, house, commercial, residential)
2. Listing type (sale or rent)
3. Price range (convert to KES numbers)
4. Location/area preferences
5. Bedroom/bathroom requirements
6. Area/size requirements
7. Special features or investment criteria

Be generous with price interpretation - "under 2M" means maxPrice: 2000000.
If the query mentions investment potential or growth, note it in investmentCriteria.`;

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
        tools: [{
          type: 'function',
          function: {
            name: 'parse_search',
            description: 'Parse search query into structured filters',
            parameters: {
              type: 'object',
              properties: {
                filters: {
                  type: 'object',
                  properties: {
                    propertyType: { 
                      type: 'string',
                      enum: ['land', 'apartment', 'house', 'commercial', 'residential', 'all'],
                      description: 'Type of property'
                    },
                    listingType: { 
                      type: 'string',
                      enum: ['sale', 'rent'],
                      description: 'Whether to buy or rent'
                    },
                    minPrice: { 
                      type: 'number',
                      description: 'Minimum price in KES'
                    },
                    maxPrice: { 
                      type: 'number',
                      description: 'Maximum price in KES'
                    },
                    location: { 
                      type: 'string',
                      description: 'Location or area name'
                    },
                    bedrooms: { 
                      type: 'number',
                      description: 'Number of bedrooms'
                    },
                    bathrooms: { 
                      type: 'number',
                      description: 'Number of bathrooms'
                    },
                    minArea: { 
                      type: 'number',
                      description: 'Minimum area in sq ft'
                    },
                    maxArea: { 
                      type: 'number',
                      description: 'Maximum area in sq ft'
                    },
                    features: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Special features like garden, pool, security'
                    },
                    investmentCriteria: {
                      type: 'string',
                      description: 'Investment-related criteria like growth potential, ROI'
                    }
                  }
                },
                reasoning: {
                  type: 'string',
                  description: 'Brief explanation of how the query was interpreted'
                },
                suggestions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Related search suggestions'
                }
              },
              required: ['filters', 'reasoning']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'parse_search' } },
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
      const result = JSON.parse(toolCall.function.arguments) as SearchResult;
      
      // If properties were provided, filter them based on the parsed filters
      if (properties && Array.isArray(properties)) {
        const filteredProperties = filterProperties(properties, result.filters);
        return new Response(JSON.stringify({
          ...result,
          matchedProperties: filteredProperties,
          totalMatches: filteredProperties.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      filters: {},
      reasoning: 'Could not parse the search query',
      suggestions: ['Try being more specific about location or price range']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Smart property search error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function filterProperties(properties: any[], filters: SearchFilters): any[] {
  return properties.filter(property => {
    // Parse property price
    const priceMatch = property.price?.match(/[\d,]+/g);
    const propertyPrice = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
    
    // Parse property area
    const areaMatch = property.area?.match(/[\d,]+/);
    const propertyArea = areaMatch ? parseInt(areaMatch[0].replace(/,/g, '')) : 0;

    // Check price range
    if (filters.minPrice && propertyPrice < filters.minPrice) return false;
    if (filters.maxPrice && propertyPrice > filters.maxPrice) return false;

    // Check property type
    if (filters.propertyType && filters.propertyType !== 'all') {
      const propType = property.type?.toLowerCase();
      const filterType = filters.propertyType.toLowerCase();
      if (filterType === 'residential') {
        if (!['house', 'apartment', 'residential'].includes(propType)) return false;
      } else if (!propType?.includes(filterType)) {
        return false;
      }
    }

    // Check listing type
    if (filters.listingType) {
      const listingType = property.listing_type?.toLowerCase();
      if (filters.listingType === 'sale' && listingType === 'rent') return false;
      if (filters.listingType === 'rent' && listingType !== 'rent') return false;
    }

    // Check location
    if (filters.location) {
      const location = property.location?.toLowerCase() || '';
      const filterLocation = filters.location.toLowerCase();
      if (!location.includes(filterLocation) && !filterLocation.includes('nairobi') && !location.includes('kenya')) {
        // Be lenient with location matching
        const locationWords = filterLocation.split(/\s+/);
        const hasMatch = locationWords.some(word => location.includes(word));
        if (!hasMatch && location.length > 0) return false;
      }
    }

    // Check bedrooms
    if (filters.bedrooms && property.bedrooms) {
      if (property.bedrooms < filters.bedrooms) return false;
    }

    // Check bathrooms
    if (filters.bathrooms && property.bathrooms) {
      if (property.bathrooms < filters.bathrooms) return false;
    }

    // Check area
    if (filters.minArea && propertyArea < filters.minArea) return false;
    if (filters.maxArea && propertyArea > filters.maxArea) return false;

    return true;
  });
}
