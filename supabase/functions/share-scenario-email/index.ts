import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, shareUrl, scenarioName, previewImageUrl, senderName } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: '$ave+ <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `${senderName} shared a financial scenario with you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${scenarioName} - Shared with you</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 12px; overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 32px; color: #00FFFF; font-weight: bold; letter-spacing: 2px;">
                        ◢◤ $AVE+ ◥◣
                      </h1>
                      <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        Digital Twin Financial Projection
                      </p>
                    </td>
                  </tr>

                  <!-- Preview Image -->
                  ${previewImageUrl ? `
                  <tr>
                    <td style="padding: 0 40px;">
                      <img src="${previewImageUrl}" alt="${scenarioName}" style="width: 100%; height: auto; border-radius: 8px; border: 1px solid rgba(0, 255, 255, 0.3);">
                    </td>
                  </tr>
                  ` : ''}

                  <!-- Message -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <p style="margin: 0 0 20px; color: #ffffff; font-size: 16px; line-height: 1.6;">
                        Hi ${recipientName || 'there'},
                      </p>
                      <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">
                        <strong>${senderName}</strong> has shared a financial scenario with you: <strong style="color: #00FFFF;">${scenarioName}</strong>
                      </p>
                      <p style="margin: 0 0 30px; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6;">
                        View the interactive timeline, Monte Carlo projections, and life event impacts that shape this financial future.
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center;">
                        <a href="${shareUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00FFFF 0%, #00CCCC 100%); color: #000000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                          View Scenario
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.3) 50%, transparent 100%);"></div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center;">
                      <p style="margin: 0 0 15px; color: rgba(255, 255, 255, 0.6); font-size: 13px; line-height: 1.5;">
                        Want to create your own financial projections?
                      </p>
                      <a href="${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://saveplus.app'}" style="color: #00FFFF; text-decoration: none; font-weight: bold; font-size: 14px;">
                        Start with $ave+ →
                      </a>
                    </td>
                  </tr>

                  <!-- Legal -->
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                      <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px; line-height: 1.5;">
                        This is a financial projection and not financial advice. Results may vary based on market conditions and individual circumstances.
                      </p>
                      <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.3); font-size: 10px;">
                        © ${new Date().getFullYear()} $ave+. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResponse.data?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});