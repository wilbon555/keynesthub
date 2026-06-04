import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function searchProperties(query: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Extract keywords for search
  const keywords = query.toLowerCase();
  
  let queryBuilder = supabase
    .from('properties')
    .select('id, title, location, price, type, bedrooms, bathrooms, area, listing_type, image')
    .eq('verification_status', 'verified')
    .eq('status', 'available')
    .limit(5);
  
  // Filter by listing type if mentioned
  if (keywords.includes('rent') || keywords.includes('lease')) {
    queryBuilder = queryBuilder.eq('listing_type', 'rent');
  } else if (keywords.includes('buy') || keywords.includes('sale') || keywords.includes('purchase')) {
    queryBuilder = queryBuilder.eq('listing_type', 'sale');
  }
  
  // Filter by property type
  if (keywords.includes('apartment') || keywords.includes('flat')) {
    queryBuilder = queryBuilder.eq('type', 'Apartment');
  } else if (keywords.includes('house') || keywords.includes('home')) {
    queryBuilder = queryBuilder.eq('type', 'House');
  } else if (keywords.includes('room') || keywords.includes('bedsitter') || keywords.includes('single')) {
    queryBuilder = queryBuilder.or('type.ilike.%room%,type.ilike.%bedsitter%,bedrooms.eq.1');
  } else if (keywords.includes('land') || keywords.includes('plot')) {
    queryBuilder = queryBuilder.eq('type', 'Land');
  } else if (keywords.includes('office') || keywords.includes('commercial')) {
    queryBuilder = queryBuilder.eq('type', 'Commercial');
  }
  
  // Search by location
  const locationPatterns = [
    'jooust', 'joust', 'kisumu', 'nairobi', 'mombasa', 'nakuru', 'eldoret',
    'westlands', 'karen', 'kilimani', 'lavington', 'kileleshwa', 'parklands',
    'ngong', 'thika', 'nyeri', 'machakos', 'kajiado', 'ruiru', 'juja'
  ];
  
  for (const loc of locationPatterns) {
    if (keywords.includes(loc)) {
      queryBuilder = queryBuilder.ilike('location', `%${loc}%`);
      break;
    }
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) {
    console.error('Property search error:', error);
    return [];
  }
  
  return data || [];
}

function formatPropertiesForAI(properties: any[]) {
  if (!properties.length) return '';
  
  const formatted = properties.map((p, i) => 
    `${i + 1}. **${p.title}** - ${p.location}\n` +
    `   - Price: ${p.price}\n` +
    `   - Type: ${p.type} (${p.listing_type})\n` +
    `   - ${p.bedrooms ? `${p.bedrooms} bed, ` : ''}${p.bathrooms ? `${p.bathrooms} bath, ` : ''}${p.area}\n` +
    `   - 🔗 [View Property](/discover?property=${p.id})`
  ).join('\n\n');
  
  return `\n\nHere are some matching properties I found:\n\n${formatted}\n\nYou can click on any property to view more details, or use our filters to narrow down by budget, room type, and distance.`;
}

const systemPrompt = `You are a helpful real estate assistant for KeyNestHub, a Kenyan property platform. Your role is to:

1. Help users find properties that match their needs (budget, location, type)
2. Answer questions about the Kenyan real estate market
3. Explain the buying, selling, and renting process in Kenya
4. Provide guidance on mortgages, property valuations, and legal requirements
5. Qualify leads by understanding their requirements

Key facts about Kenyan real estate:
- Popular areas: Nairobi (Westlands, Karen, Kilimani, Lavington), Mombasa, Kisumu, Nakuru
- Property types: Apartments, townhouses, bungalows, maisonettes, land, bedsitters, single rooms
- Currency: KES (Kenyan Shillings)
- Common rent ranges: Single rooms (3K-10K KES), Bedsitters (5K-15K KES), 1BR (15K-40K KES), 2BR (25K-80K KES)
- Common sale prices: Entry-level (1-5M KES), Mid-range (5-15M KES), Premium (15-50M KES), Luxury (50M+ KES)

IMPORTANT INSTRUCTIONS:
- When property listings are provided in the context, ALWAYS include them in your response with clickable links
- Guide users to use the platform's filters for: budget range, number of rooms, property type, and location
- Mention specific filters available: price slider, bedroom count, property type dropdown, location search
- Be conversational and helpful, guiding users toward taking action (viewing properties, contacting agents)
- Keep responses concise but informative`;

serve(async (req) => {
  console.log('Property chatbot function invoked');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('Received messages count:', messages?.length);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get the latest user message to search properties
    const latestUserMessage = messages?.filter((m: any) => m.role === 'user').pop()?.content || '';
    
    // Search for relevant properties based on user query
    let propertyContext = '';
    if (latestUserMessage) {
      console.log('Searching properties for:', latestUserMessage);
      const properties = await searchProperties(latestUserMessage);
      console.log('Found properties:', properties.length);
      propertyContext = formatPropertiesForAI(properties);
    }

    // Enhance the last user message with property context
    const enhancedMessages = messages.map((m: any, index: number) => {
      if (index === messages.length - 1 && m.role === 'user' && propertyContext) {
        return {
          ...m,
          content: m.content + `\n\n[SYSTEM CONTEXT - Available listings matching the query:${propertyContext}]`
        };
      }
      return m;
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...enhancedMessages,
        ],
        stream: true,
      }),
    });

    console.log('AI gateway response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'AI service quota exceeded. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Property chatbot error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});