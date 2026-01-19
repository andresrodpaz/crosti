import { createBrowserClient } from "@supabase/ssr"

const globalForSupabase = globalThis as unknown as {
  supabaseClient: ReturnType<typeof createBrowserClient> | null
}

// Initialize to null
if (!globalForSupabase.supabaseClient) {
  globalForSupabase.supabaseClient = null
}

export function createClient() {
  // Only create client in browser environment
  if (typeof window === "undefined") {
    return null
  }

  // Return existing singleton instance
  if (globalForSupabase.supabaseClient) {
    return globalForSupabase.supabaseClient
  }

  // Create new singleton instance
  globalForSupabase.supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return globalForSupabase.supabaseClient
}
