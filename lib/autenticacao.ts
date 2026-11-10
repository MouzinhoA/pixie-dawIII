import { supabase } from "@/lib/supabase"

const MENSAGENS_ERRO: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  user_already_exists: "Já existe uma conta com este e-mail.",
  email_address_invalid: "Este e-mail não existe ou não recebe mensagens. Confira o endereço (ex.: @gmail.com).",
  weak_password: "Senha fraca. Use pelo menos 6 caracteres.",
  email_provider_disabled: "O acesso por e-mail está desativado no momento. Tente novamente mais tarde.",
  signup_disabled: "Novos cadastros estão desativados no momento. Tente novamente mais tarde.",
  over_email_send_rate_limit: "Muitos cadastros em pouco tempo. Aguarde alguns minutos e tente novamente.",
  unexpected_failure: "Não foi possível criar a conta. Verifique se este CPF já está cadastrado.",
}

function traduzirErro(erro: { code?: string; message: string }, padrao: string): Error {
  console.error("Erro do Supabase Auth:", erro.code, erro.message)
  return new Error((erro.code && MENSAGENS_ERRO[erro.code]) || padrao)
}

export async function cadastrar(nome: string, cpf: string, email: string, senha: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { tipo: "vendedor", nome, cpf } },
  })
  if (error) throw traduzirErro(error, "Não foi possível criar a conta. Tente novamente.")
  if (!data.session) throw new Error("Conta criada, mas o login exige confirmação por e-mail. Fale com o administrador.")
}

export async function entrar(email: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw traduzirErro(error, "Não foi possível entrar. Tente novamente.")
}

export async function buscarIdVendedorLogado(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error("Sua sessão expirou. Entre novamente.")
  return data.session.user.id
}

export async function sair() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error("Não foi possível sair. Tente novamente.")
}
