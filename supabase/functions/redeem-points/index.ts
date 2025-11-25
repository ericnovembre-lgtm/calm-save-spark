import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RedemptionRequest {
  catalogItemId: string;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { catalogItemId, userId } = await req.json() as RedemptionRequest;

    console.log(`Processing redemption for user ${userId}, item ${catalogItemId}`);

    // Get catalog item
    const { data: catalogItem, error: catalogError } = await supabase
      .from('redemption_catalog')
      .select('*')
      .eq('id', catalogItemId)
      .eq('is_active', true)
      .single();

    if (catalogError || !catalogItem) {
      throw new Error('Invalid redemption item');
    }

    // Get user's current tier status and points
    const { data: tierStatus, error: tierError } = await supabase
      .from('card_tier_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tierError || !tierStatus) {
      throw new Error('User tier status not found');
    }

    // Check if user has enough points
    if (tierStatus.total_points < catalogItem.points_cost) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient points',
          required: catalogItem.points_cost,
          available: tierStatus.total_points,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('points_redemptions')
      .insert({
        user_id: userId,
        catalog_item_id: catalogItemId,
        points_spent: catalogItem.points_cost,
        dollar_value: catalogItem.dollar_value,
        redemption_type: catalogItem.redemption_type,
        status: 'processing',
        fulfillment_details: {
          catalog_name: catalogItem.name,
          partner_name: catalogItem.partner_name,
        },
      })
      .select()
      .single();

    if (redemptionError) {
      throw redemptionError;
    }

    // Deduct points from tier status
    const { error: updateTierError } = await supabase
      .from('card_tier_status')
      .update({
        total_points: tierStatus.total_points - catalogItem.points_cost,
      })
      .eq('user_id', userId);

    if (updateTierError) {
      throw updateTierError;
    }

    // Add negative entry to points ledger
    const { error: ledgerError } = await supabase
      .from('card_points_ledger')
      .insert({
        user_id: userId,
        points_type: 'redemption',
        points_amount: -catalogItem.points_cost,
        description: `Redeemed: ${catalogItem.name}`,
        metadata: {
          redemption_id: redemption.id,
          catalog_item_id: catalogItemId,
        },
      });

    if (ledgerError) {
      console.error('Error creating ledger entry:', ledgerError);
    }

    // Simulate fulfillment (in production, this would integrate with partner APIs)
    const fulfillmentDetails: any = {
      catalog_name: catalogItem.name,
      partner_name: catalogItem.partner_name,
      redeemed_at: new Date().toISOString(),
    };

    if (catalogItem.redemption_type === 'gift_card') {
      // Generate mock gift card code
      fulfillmentDetails.gift_card_code = `GC-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      fulfillmentDetails.instructions = 'Use this code at checkout or in-store';
    } else if (catalogItem.redemption_type === 'cashback') {
      fulfillmentDetails.instructions = 'Credit will appear on your next statement';
      fulfillmentDetails.estimated_arrival = 'Within 2-3 business days';
    } else if (catalogItem.redemption_type === 'travel_credit') {
      fulfillmentDetails.credit_code = `TC-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      fulfillmentDetails.instructions = 'Enter this code when booking travel';
    }

    // Update redemption with fulfillment details
    const { error: updateRedemptionError } = await supabase
      .from('points_redemptions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        fulfillment_details: fulfillmentDetails,
      })
      .eq('id', redemption.id);

    if (updateRedemptionError) {
      console.error('Error updating redemption:', updateRedemptionError);
    }

    console.log(`Successfully processed redemption ${redemption.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        redemption: {
          ...redemption,
          fulfillment_details: fulfillmentDetails,
          status: 'completed',
        },
        remaining_points: tierStatus.total_points - catalogItem.points_cost,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in redeem-points:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
