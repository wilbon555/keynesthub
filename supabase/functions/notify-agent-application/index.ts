import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
