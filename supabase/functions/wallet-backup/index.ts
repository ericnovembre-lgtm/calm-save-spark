import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, wallet_id, seed_phrase, password, encryption_hint, encrypted_backup } = await req.json();

    if (action === 'create') {
      // Client-side encryption is performed by the UI
      // This endpoint just stores the encrypted backup
      if (!wallet_id || !encrypted_backup || !password) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Additional server-side encryption using password as key
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        passwordKey,
        new TextEncoder().encode(encrypted_backup)
      );

      // Combine IV and encrypted data
      const combinedBuffer = new Uint8Array(iv.length + encryptedData.byteLength);
      combinedBuffer.set(iv, 0);
      combinedBuffer.set(new Uint8Array(encryptedData), iv.length);

      // Convert to base64
      const base64Encrypted = btoa(String.fromCharCode(...combinedBuffer));

      // Store in database
      const { data, error } = await supabaseClient
        .from('wallet_backups')
        .upsert({
          user_id: user.id,
          wallet_id,
          encrypted_seed_phrase: base64Encrypted,
          encryption_hint: encryption_hint || null,
          backup_type: 'full',
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await supabaseClient
        .from('wallet_backup_audit_log')
        .insert({
          backup_id: data.id,
          user_id: user.id,
          action: 'created',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
        });

      return new Response(
        JSON.stringify({ success: true, backup: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'recover') {
      if (!wallet_id || !password) {
        return new Response(
          JSON.stringify({ error: 'Missing wallet_id or password' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch backup
      const { data: backup, error: fetchError } = await supabaseClient
        .from('wallet_backups')
        .select('*')
        .eq('wallet_id', wallet_id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !backup) {
        return new Response(
          JSON.stringify({ error: 'Backup not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decrypt
      try {
        const combined = Uint8Array.from(atob(backup.encrypted_seed_phrase), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);

        const passwordKey = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(password.padEnd(32, '0').slice(0, 32)),
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );

        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          passwordKey,
          encryptedData
        );

        const decryptedBackup = new TextDecoder().decode(decryptedBuffer);

        // Update last accessed
        await supabaseClient
          .from('wallet_backups')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('id', backup.id);

        // Log audit trail
        await supabaseClient
          .from('wallet_backup_audit_log')
          .insert({
            backup_id: backup.id,
            user_id: user.id,
            action: 'recovered',
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
          });

        return new Response(
          JSON.stringify({ success: true, decrypted_backup: decryptedBackup }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (decryptError) {
        return new Response(
          JSON.stringify({ error: 'Incorrect password or corrupted backup' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Wallet backup error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
