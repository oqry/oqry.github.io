import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hashPhrase(phrase: string): Promise<string> {
  const normalized = phrase.trim().toUpperCase().replace(/\s+/g, '');
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const fail = () =>
    new Response(JSON.stringify({ recognized: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const { alias, phrase } = await req.json();

    if (!alias || typeof alias !== 'string' || !alias.trim()) return fail();
    if (!phrase || typeof phrase !== 'string' || !phrase.trim()) return fail();

    const hash = await hashPhrase(phrase);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase
      .from('investigators')
      .select('id, alias, investigator_number')
      .eq('alias', alias.trim())
      .eq('recovery_phrase_hash', hash)
      .single();

    if (error || !data) return fail();

    return new Response(
      JSON.stringify({ recognized: true, investigator: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch {
    return fail();
  }
});
