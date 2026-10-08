const { supabase, logEventToSupabase } = require('./supabase');

async function testSupabase() {
  if (!supabase) {
    console.log("TEST FAILED: Supabase client is null. Did you set your SUPABASE_KEY in .env?");
    return;
  }

  console.log("Supabase client initialized. Testing connection...");
  
  try {
    const { data, error } = await supabase
      .from('observatory_events')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error("TEST FAILED: Error querying Supabase. Did you create the table in the SQL Editor?");
      console.error("Error details:", error.message);
    } else {
      console.log("TEST SUCCESS! Connection to Supabase established and 'observatory_events' table exists.");
    }
  } catch (err) {
    console.error("TEST FAILED: Exception occurred:", err.message);
  }
}

testSupabase();
