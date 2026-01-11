import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Newsletter welcome email function called");
  
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
    const { email }: WelcomeEmailRequest = await req.json();
    
    console.log("Attempting to send welcome email to:", email);

    if (!email) {
      console.error("No email provided in request");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "KeyNestHub <hello@keynesthub.com>",
      to: [email],
      subject: "Welcome to KeyNestHub Newsletter! 🏠",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Welcome to KeyNestHub! 🏠</h1>
              <p style="color: #94a3b8; margin: 0; font-size: 16px;">Your trusted partner in real estate</p>
            </div>
            
            <div style="background: #ffffff; border-radius: 16px; padding: 40px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for subscribing to our newsletter! You're now part of our community of property enthusiasts.
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Here's what you can expect from us:
              </p>
              
              <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 25px 0;">
                <li>🏡 Latest property listings in your area</li>
                <li>📊 Market trends and investment insights</li>
                <li>💡 Tips for buying, selling, and renting</li>
                <li>🎉 Exclusive offers and early access to new listings</li>
              </ul>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://keynesthub.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Browse Properties
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} KeyNestHub. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Nairobi, Kenya | keynesthub@gmail.com | +254 701 555 240
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", JSON.stringify(emailResponse));

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
