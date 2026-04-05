import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyInquiryRequest {
  propertyTitle: string;
  propertyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  message: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { propertyTitle, propertyId, requesterName, requesterEmail, requesterPhone, message }: NotifyInquiryRequest = await req.json();

    // Create Supabase client with service role to fetch agents
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch approved agents and admins
    const { data: agentRoles, error: rolesError } = await supabaseServiceClient
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["agent", "admin"])
      .eq("approved", true);

    if (rolesError) {
      console.error("Error fetching agent roles:", rolesError);
      throw rolesError;
    }

    if (!agentRoles || agentRoles.length === 0) {
      console.log("No approved agents found to notify");
      return new Response(JSON.stringify({ message: "No agents to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const agentUserIds = agentRoles.map(r => r.user_id);
    const { data: agentApps, error: appsError } = await supabaseServiceClient
      .from("agent_applications")
      .select("user_id, email, full_name")
      .in("user_id", agentUserIds);

    if (appsError) {
      console.error("Error fetching agent applications:", appsError);
    }

    const agentEmails = (agentApps || []).map(app => app.email).filter(Boolean);

    if (agentEmails.length === 0) {
      console.log("No agent emails found to notify");
      return new Response(JSON.stringify({ message: "No agent emails found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Sending inquiry notification to ${agentEmails.length} agents`);

    // Sanitize user inputs for HTML email
    const sanitize = (str: string) => str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c] || c));

    const emailResponse = await resend.emails.send({
      from: "KeyNestHub <onboarding@resend.dev>",
      to: agentEmails,
      subject: `New Property Inquiry: ${sanitize(propertyTitle)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a365d;">New Property Inquiry</h1>
          <p>A new inquiry has been submitted for the property:</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #2d3748;">${sanitize(propertyTitle)}</h2>
          </div>
          
          <h3 style="color: #1a365d;">Inquirer Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${sanitize(requesterName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${sanitize(requesterEmail)}</td>
            </tr>
            ${requesterPhone ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${sanitize(requesterPhone)}</td>
            </tr>
            ` : ''}
            ${message ? `
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Message:</strong></td>
              <td style="padding: 8px 0;">${sanitize(message)}</td>
            </tr>
            ` : ''}
          </table>
          
          <p style="margin-top: 20px;">
            Please log in to your <a href="https://keynesthub.lovable.app/agent-dashboard" style="color: #3182ce;">Agent Dashboard</a> 
            to review and process this inquiry.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #718096; font-size: 12px;">
            This is an automated notification from KeyNestHub.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-new-inquiry function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
