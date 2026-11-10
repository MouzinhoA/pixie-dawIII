import { supabase } from "@/lib/supabase"

const MENSAGENS_ERRO: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  email_provider_disabled: "O acesso por e-mail está desativado no momento. Tente novamente mais tarde.",
}

function traduzirErro(erro: { code?: string; message: string }, padrao: string): Error {
  console.error("Erro do Supabase Auth:", erro.code, erro.message)
  return new Error((erro.code && MENSAGENS_ERRO[erro.code]) || padrao)
}

export async function entrar(email: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw traduzirErro(error, "Não foi possível entrar. Tente novamente.")
}

export async function sair() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error("Não foi possível sair. Tente novamente.")
}
