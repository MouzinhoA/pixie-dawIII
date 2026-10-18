import { createClient } from "@supabase/supabase-js"

// As variáveis ficam no arquivo .env.local (fora do Git).
// O prefixo NEXT_PUBLIC_ permite usá-las no navegador. A chave usada aqui é a
// pública (publishable/anon); quem controla o acesso de fato são as políticas RLS do banco.
const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
const chavePublicaSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!urlSupabase || !chavePublicaSupabase) {
  throw new Error(
    "Variáveis do Supabase ausentes. Crie o arquivo .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
  )
}

// Cliente único reaproveitado por toda a aplicação
export const supabase = createClient(urlSupabase, chavePublicaSupabase)
