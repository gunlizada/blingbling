// ============================================================
//  BLING BLING BAKU — Supabase Configuration
//  ⚠️  PASTE YOUR CREDENTIALS BELOW
//  You get these from: supabase.com → your project → Settings → API
// ============================================================

const SUPABASE_URL = 'https://nihjwidrsbtiolgruzsi.supabase.co';
// Example: 'https://xyzabcdef.supabase.co'

const SUPABASE_ANON_KEY = 'sb_publishable_DuZfigPwZuae5_K53eCf4g_CHpaqE3p';
// Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// WhatsApp number (no + sign, no spaces)
const WA_NUMBER = '994702003335';

// ============================================================
//  DO NOT EDIT BELOW THIS LINE
// ============================================================

// Supabase JS client (loaded via CDN in HTML files)
let supabase;
function initSupabase() {
  if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error('Supabase JS not loaded. Check CDN script tag.');
  }
}
