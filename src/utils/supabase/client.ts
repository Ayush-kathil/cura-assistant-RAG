import { createBrowserClient } from '@supabase/ssr'

let supabaseBrowserClientInstance: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (supabaseBrowserClientInstance) return supabaseBrowserClientInstance;
  supabaseBrowserClientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return supabaseBrowserClientInstance;
}
