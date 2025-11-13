import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch pending notifications
    const { data: notifications, error: fetchError } = await supabaseClient
      .from('notification_queue')
      .select('*, profiles!inner(email, full_name)')
      .eq('status', 'pending')
      .limit(50);

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      throw fetchError;
    }

    console.log(`Processing ${notifications?.length || 0} notifications`);

    let sentCount = 0;
    let errorCount = 0;

    for (const notification of notifications || []) {
      try {
        const userEmail = notification.profiles?.email;
        const userName = notification.profiles?.full_name || 'there';

        if (!userEmail) {
          console.error(`No email found for user ${notification.user_id}`);
          continue;
        }

        // Build email content based on notification type
        let htmlContent = '';
        
        switch (notification.notification_type) {
          case 'challenge_completion':
            htmlContent = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #0a0a0a;">🎉 Challenge Completed!</h1>
                <p>Hi ${userName},</p>
                <p>Congratulations! You've completed the <strong>${notification.content.challenge_name}</strong> challenge.</p>
                <p>You've earned <strong>${notification.content.reward_points}</strong> points!</p>
                <p style="margin-top: 30px;">Keep up the great work!</p>
                <p style="color: #6b7280; margin-top: 40px;">— The $ave+ Team</p>
              </div>
            `;
            break;

          case 'referral_reward':
            htmlContent = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #0a0a0a;">💰 Referral Reward Earned!</h1>
                <p>Hi ${userName},</p>
                <p>Great news! Your referral has been approved.</p>
                <p>You've earned a <strong>$${notification.content.reward_amount}</strong> reward!</p>
                <p style="margin-top: 30px;">Thank you for spreading the word about $ave+!</p>
                <p style="color: #6b7280; margin-top: 40px;">— The $ave+ Team</p>
              </div>
            `;
            break;

          case 'milestone_achievement':
            htmlContent = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #0a0a0a;">🏆 New Milestone Achieved!</h1>
                <p>Hi ${userName},</p>
                <p>You've reached a new milestone: <strong>${notification.content.milestone_name}</strong></p>
                <p>${notification.content.milestone_description}</p>
                <p style="margin-top: 30px;">You're making amazing progress on your savings journey!</p>
                <p style="color: #6b7280; margin-top: 40px;">— The $ave+ Team</p>
              </div>
            `;
            break;

          case 'goal_milestone':
            htmlContent = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #0a0a0a;">🎯 Goal Progress Update!</h1>
                <p>Hi ${userName},</p>
                <p>You've reached <strong>${notification.content.progress_percentage}%</strong> of your goal: <strong>${notification.content.goal_name}</strong></p>
                <p>Current amount: $${notification.content.current_amount} / $${notification.content.target_amount}</p>
                <p style="margin-top: 30px;">Keep going! You're on the right track!</p>
                <p style="color: #6b7280; margin-top: 40px;">— The $ave+ Team</p>
              </div>
            `;
            break;

          default:
            htmlContent = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #0a0a0a;">${notification.subject}</h1>
                <p>Hi ${userName},</p>
                <p>${notification.content.message || 'You have a new notification from $ave+'}</p>
                <p style="color: #6b7280; margin-top: 40px;">— The $ave+ Team</p>
              </div>
            `;
        }

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: '$ave+ <notifications@resend.dev>',
          to: [userEmail],
          subject: notification.subject,
          html: htmlContent,
        });

        if (emailError) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
          errorCount++;
          continue;
        }

        // Mark as sent
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', notification.id);

        sentCount++;
        console.log(`Email sent to ${userEmail} for ${notification.notification_type}`);
      } catch (notificationError) {
        console.error('Error processing notification:', notificationError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sent_count: sentCount,
        error_count: errorCount,
        total_processed: notifications?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Function error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
