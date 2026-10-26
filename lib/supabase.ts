import { createClient } from "@supabase/supabase-js"

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
const chavePublicaSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!urlSupabase || !chavePublicaSupabase) {
  throw new Error(
    "Variáveis do Supabase ausentes. Crie o arquivo .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
  )
}

export const supabase = createClient(urlSupabase, chavePublicaSupabase)
