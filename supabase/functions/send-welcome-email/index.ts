import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Welcome email function called");

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
    const { userId, email, fullName }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email}`);

    if (!email || !fullName) {
      console.error("Missing required fields: email or fullName");
      return new Response(
        JSON.stringify({ error: "Email and fullName are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const sanitize = (str: string) => 
      str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c] || c));

    const emailResponse = await resend.emails.send({
      from: "KeyNestHub <onboarding@keynesthub.com>",
      to: [email],
      subject: "Welcome to KeyNestHub! 🎉",
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
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { color: #333; line-height: 1.6; }
            .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature-item { background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; }
            .feature-item h3 { margin: 0 0 10px 0; color: #059669; font-size: 16px; }
            .feature-item p { margin: 0; font-size: 14px; color: #666; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; }
            .button:hover { background: #059669; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
            .tips { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 20px 0; }
            .tips h4 { margin: 0 0 10px 0; color: #1e40af; }
            .tips ul { margin: 0; padding-left: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1>Your Account is Active! 🎉</h1>
              </div>
              
              <div class="content">
                <p>Hi ${sanitize(fullName)},</p>
                
                <p>Your email has been successfully verified! Your KeyNestHub account is now fully activated and ready to use.</p>
                
                <p><strong>Here's what you can do now:</strong></p>
                
                <div class="feature-grid">
                  <div class="feature-item">
                    <h3>🔍 Search Properties</h3>
                    <p>Browse thousands of residential, commercial, and rental properties across Kenya.</p>
                  </div>
                  <div class="feature-item">
                    <h3>📋 List Your Property</h3>
                    <p>Showcase your property to potential buyers and renters with rich listings.</p>
                  </div>
                  <div class="feature-item">
                    <h3>💬 Contact Agents</h3>
                    <p>Connect with verified real estate agents for guidance and support.</p>
                  </div>
                  <div class="feature-item">
                    <h3>❤️ Save Favorites</h3>
                    <p>Build your wishlist and receive notifications about new properties.</p>
                  </div>
                </div>
                
                <div class="button-container">
                  <a href="https://keynesthub.com/dashboard" class="button">Go to Your Dashboard</a>
                </div>
                
                <div class="tips">
                  <h4>💡 Pro Tips to Get Started:</h4>
                  <ul>
                    <li><strong>Complete Your Profile:</strong> Add a profile photo and bio to build trust</li>
                    <li><strong>Explore Neighborhoods:</strong> Use our neighborhood guides to find your ideal area</li>
                    <li><strong>Set Up Alerts:</strong> Get notified when properties matching your criteria are listed</li>
                    <li><strong>Become an Agent:</strong> Apply to become a verified agent on our platform</li>
                  </ul>
                </div>
                
                <p>If you have any questions or need assistance, feel free to reach out to our support team at <strong>info@keynesthub.com</strong></p>
                
                <p>Happy house hunting!<br><strong>The KeyNestHub Team</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2026 KeyNestHub. All rights reserved. | Nairobi, Kenya</p>
                <p><a href="https://keynesthub.com/contact" style="color: #10b981; text-decoration: none;">Contact Support</a> | <a href="https://keynesthub.com/privacy" style="color: #10b981; text-decoration: none;">Privacy Policy</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
