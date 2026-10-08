require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseKey !== 'YOUR_ANON_KEY_HERE') {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[SUPABASE] Client initialized successfully.');
} else {
  console.log('[SUPABASE] ⚠️ Client NOT initialized. Please set SUPABASE_KEY in .env');
}

/**
 * Helper to log events to Supabase asynchronously without blocking the main thread.
 */
const logEventToSupabase = async (eventData) => {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('observatory_events')
      .insert([eventData]);
      
    if (error) {
      console.error('[SUPABASE] Error inserting event:', error.message);
    }
  } catch (err) {
    console.error('[SUPABASE] Exception inserting event:', err.message);
  }
};

module.exports = { supabase, logEventToSupabase };
