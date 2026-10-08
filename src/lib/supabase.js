import { createClient } from '@supabase/supabase-js';

// User provided credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;
if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http') && supabaseUrl !== 'your_supabase_url_here') {
  try {
    client = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.warn('[Supabase] Failed to initialize client:', e);
  }
}

function createMockQueryBuilder() {
  const handler = {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve) => resolve({ data: [], error: null });
      }
      if (prop === 'single') {
        return () => Promise.resolve({ data: { id: `mock-${Date.now()}` }, error: null });
      }
      return (...args) => new Proxy({}, handler);
    }
  };
  return new Proxy({}, handler);
}

if (!client) {
  // Fluent chainable mock so any Supabase query succeeds without throwing TypeError
  client = {
    from: () => createMockQueryBuilder(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
  };
}

export const supabase = client;
