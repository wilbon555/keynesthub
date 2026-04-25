import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignupVerificationRequest {
  email: string;
  firstName: string;
  verificationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Signup verification email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(apiKey);
    const { email, firstName, verificationUrl }: SignupVerificationRequest = await req.json();

    console.log(`Sending verification email to: ${email}`);

    if (!email || !verificationUrl) {
      console.error("Missing required fields: email or verificationUrl");
      return new Response(
        JSON.stringify({ error: "Email and verificationUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const sanitize = (str: string) => 
      str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c] || c));

    const emailResponse = await resend.emails.send({
      from: "KeyNestHub <noreply@keynesthub.com>",
      to: [email],
      subject: "Verify Your KeyNestHub Email Address 🔐",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { color: #333; line-height: 1.6; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; }
            .button:hover { background: #2563eb; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
            .expires { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1>Welcome to KeyNestHub! 🏠</h1>
              </div>
              
              <div class="content">
                <p>Hi ${sanitize(firstName)},</p>
                
                <p>Thank you for signing up for KeyNestHub! We're excited to have you join our community of property buyers, sellers, and investors.</p>
                
                <p>To get started, please verify your email address by clicking the button below:</p>
                
                <div class="button-container">
                  <a href="${sanitize(verificationUrl)}" class="button">Verify Your Email</a>
                </div>
                
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 4px; font-size: 12px;">
                  ${sanitize(verificationUrl)}
                </p>
                
                <div class="expires">
                  ⏰ This link will expire in 24 hours. Please verify your email soon.
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ul>
                  <li>Complete your profile</li>
                  <li>Browse properties or list your own</li>
                  <li>Connect with agents and other users</li>
                </ul>
                
                <p>If you didn't create this account, you can safely ignore this email.</p>
                
                <p>Best regards,<br><strong>The KeyNestHub Team</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2026 KeyNestHub. All rights reserved. | Nairobi, Kenya</p>
                <p>Need help? <a href="https://keynesthub.com/contact" style="color: #3b82f6; text-decoration: none;">Contact Support</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-signup-verification function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
