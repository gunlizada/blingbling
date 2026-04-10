// ============================================================
//  BLING BLING BAKU — Supabase Configuration
//  ⚠️  PASTE YOUR CREDENTIALS BELOW
//  You get these from: supabase.com → your project → Settings → API
// ============================================================

const SUPABASE_URL = 'https://nihjwidrsbtiolgruzsi.supabase.co';
// Example: 'https://xyzabcdef.supabase.co'

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paGp3aWRyc2J0aW9sZ3J1enNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjI1OTMsImV4cCI6MjA5MTI5ODU5M30.JtjmM2JuAGiKkAJ3cd07_76W--7uqc46LSxRmbn7Mnk';
// Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// WhatsApp number (no + sign, no spaces)
const WA_NUMBER = '994702003335';

// ============================================================
//  DO NOT EDIT BELOW THIS LINE
// ============================================================

// Supabase JS client (loaded via CDN in HTML files)
// The UMD bundle sets window.supabase to the library { createClient, ... }.
// We replace it with the real client so supabase.from() / .storage work everywhere.
function initSupabase() {
  const supabaseLib = window.supabase;
  if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
    console.error('Supabase JS not loaded. Check CDN script tag.');
    return;
  }
  window.supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
