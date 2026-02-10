import { createBrowserClient, createServerClient } from "@supabase/ssr";

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
  );
}

export function createSupabaseServerClient(props: {
  cookies: () => Promise<{ getAll: () => { name: string; value: string }[]; set: (name: string, value: string, options?: Record<string, unknown>) => void }>;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await props.cookies()).getAll();
        },
        async setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
        ) {
          const store = await props.cookies();
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        },
      },
    }
  );
}
