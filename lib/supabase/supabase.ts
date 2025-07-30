import { createClient } from '@supabase/supabase-js'

// Environment variables - NO FALLBACKS for production security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

if (!supabaseServiceKey) {
  throw new Error('Missing required Supabase service role key: SUPABASE_SERVICE_ROLE_KEY')
}

// Create a Supabase client for browser/client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Create a Supabase admin client for server-side usage with service role key
// This should only be used in server-side code (API routes, Server Components)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get URL for a file in a storage bucket
export const getStorageFileUrl = (bucket: string, path: string): string => {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

// Helper function to validate Supabase connection
export const validateSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('tours').select('count').limit(1)
    return !error
  } catch {
    return false
  }
}

// Enhanced connection validation with detailed error reporting
export async function validateSupabaseConnectionDetailed() {
  try {
    const { error } = await supabaseAdmin
      .from('tours')
      .select('count(*)')
      .single();

    if (error) {
      console.error('Supabase connection validation failed:', error.message);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      connected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Supabase connection validation error:', err);
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
