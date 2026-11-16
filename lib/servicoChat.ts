import { supabase } from "@/lib/supabase"
import type { Mensagem } from "@/lib/tipos"

const TABELA_MENSAGENS = "mensagens"

function criarErro(acao: string, erro: { message: string; code?: string }): Error {
  let motivo = erro.message
  if (erro.code === "42501") motivo = "o chat só aceita mensagens enquanto a negociação está em andamento"
  if (erro.code === "23514") motivo = "a mensagem precisa ter entre 1 e 1000 caracteres"
  if (erro.code === "PGRST205") motivo = "rode o script supabase/chat_mensagens.sql no banco"
  return new Error(`Não foi possível ${acao}: ${motivo}.`)
}

export async function buscarMensagens(interesseId: number): Promise<Mensagem[]> {
  const { data, error } = await supabase
    .from(TABELA_MENSAGENS)
    .select("*")
    .eq("interesse_id", interesseId)
    .order("criado_em", { ascending: true })

  if (error) throw criarErro("carregar a conversa", error)
  return data
}

export async function enviarMensagem(interesseId: number, conteudo: string): Promise<Mensagem> {
  const { data, error } = await supabase
    .from(TABELA_MENSAGENS)
    .insert({ interesse_id: interesseId, conteudo })
    .select()
    .single()

  if (error) throw criarErro("enviar a mensagem", error)
  return data
}


export function escutarMensagens(interesseId: number, aoReceber: (mensagem: Mensagem) => void): () => void {
  const canal = supabase
    .channel(`chat-interesse-${interesseId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: TABELA_MENSAGENS,
        filter: `interesse_id=eq.${interesseId}`,
      },
      (payload) => aoReceber(payload.new as Mensagem)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}


export function adicionarSemDuplicar(lista: Mensagem[], nova: Mensagem): Mensagem[] {
  if (lista.some((mensagem) => mensagem.id === nova.id)) return lista
  return [...lista, nova].sort((a, b) => a.id - b.id)
}
