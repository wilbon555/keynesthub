import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyAgentRequest {
  email: string;
  fullName: string;
  status: "approved" | "rejected";
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

    // Verify caller is an admin
    const userId = claimsData.claims.sub;
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roleCheck } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { email, fullName, status }: NotifyAgentRequest = await req.json();

    console.log(`Sending ${status} notification to ${email} for ${fullName}`);

    const isApproved = status === "approved";
    const subject = isApproved
      ? "🎉 Your Agent Application Has Been Approved!"
      : "Update on Your Agent Application";

    const html = isApproved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">Congratulations, ${fullName}!</h1>
          <p>Great news! Your application to become an agent on KeynesHub has been <strong>approved</strong>.</p>
          <p>You now have access to:</p>
          <ul>
            <li>List and manage property listings</li>
            <li>Receive and respond to client inquiries</li>
            <li>Schedule property viewings</li>
            <li>Access agent-exclusive features</li>
          </ul>
          <p>Log in to your account to start using your new agent privileges.</p>
          <p style="margin-top: 30px;">Welcome to the team!</p>
          <p>Best regards,<br>The KeynesHub Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6b7280;">Hello ${fullName},</h1>
          <p>Thank you for your interest in becoming an agent on KeynesHub.</p>
          <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
          <p>This could be due to various factors such as incomplete information or current availability.</p>
          <p>You're welcome to:</p>
          <ul>
            <li>Update your profile with more details</li>
            <li>Reapply after 30 days with additional qualifications</li>
            <li>Contact our support team for more information</li>
          </ul>
          <p style="margin-top: 30px;">Best regards,<br>The KeynesHub Team</p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "KeynesHub <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-agent-application function:", error);
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
