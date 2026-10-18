import { supabase } from "@/lib/supabase"
import type {
  Categoria,
  DadosItem,
  FiltrosItens,
  ItemColecao,
  OrdenacaoItens,
  StatusAnuncio,
} from "@/lib/tipos"

// Camada de dados: única parte do sistema que conversa com o Supabase.
// As páginas e componentes chamam estas funções e não sabem como o banco funciona.

const TABELA_ITENS = "produtos"
const TABELA_CATEGORIAS = "categorias"

// Coluna e direção usadas em cada opção de ordenação
const REGRAS_ORDENACAO: Record<OrdenacaoItens, { coluna: string; crescente: boolean }> = {
  recentes: { coluna: "criado_em", crescente: false },
  antigos: { coluna: "criado_em", crescente: true },
  nome: { coluna: "titulo", crescente: true },
  menor_preco: { coluna: "preco", crescente: true },
  maior_preco: { coluna: "preco", crescente: false },
}

// Converte o erro técnico do Supabase/PostgreSQL em uma mensagem compreensível
function criarErro(acao: string, erro: { message: string; code?: string }): Error {
  let motivo = erro.message
  if (erro.code === "42501") motivo = "sem permissão no banco (verifique as políticas RLS)"
  if (erro.code === "23514") motivo = "um dos valores viola uma regra do banco"
  if (erro.code === "23503") motivo = "a categoria escolhida não existe"
  if (erro.code === "PGRST116") motivo = "item não encontrado"
  return new Error(`Não foi possível ${acao}: ${motivo}.`)
}

export async function buscarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from(TABELA_CATEGORIAS)
    .select("id, nome")
    .order("nome")

  if (error) throw criarErro("carregar as categorias", error)
  return data
}

// Busca os itens aplicando busca por nome, filtros e ordenação direto no banco
export async function buscarItens(filtros?: Partial<FiltrosItens>): Promise<ItemColecao[]> {
  const ordenacao = REGRAS_ORDENACAO[filtros?.ordenacao ?? "recentes"]

  let consulta = supabase
    .from(TABELA_ITENS)
    .select("*")
    .order(ordenacao.coluna, { ascending: ordenacao.crescente })

  const busca = filtros?.busca?.trim()
  if (busca) consulta = consulta.ilike("titulo", `%${busca}%`) // ilike ignora maiúsculas/minúsculas
  if (filtros?.categoriaId) consulta = consulta.eq("categoria_id", filtros.categoriaId)
  if (filtros?.status) consulta = consulta.eq("status", filtros.status)

  const { data, error } = await consulta
  if (error) throw criarErro("carregar os itens", error)
  return data
}

export async function buscarItemPorId(id: number): Promise<ItemColecao> {
  const { data, error } = await supabase
    .from(TABELA_ITENS)
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw criarErro("carregar o item", error)
  return data
}

export async function cadastrarItem(dados: DadosItem): Promise<ItemColecao> {
  const { data, error } = await supabase
    .from(TABELA_ITENS)
    .insert(dados)
    .select()
    .single()

  if (error) throw criarErro("cadastrar o item", error)
  return data
}

export async function atualizarItem(id: number, dados: Partial<DadosItem>): Promise<ItemColecao> {
  const { data, error } = await supabase
    .from(TABELA_ITENS)
    .update(dados)
    .eq("id", id)
    .select()
    .single()

  if (error) throw criarErro("salvar as alterações", error)
  return data
}

export async function alterarStatus(id: number, status: StatusAnuncio): Promise<ItemColecao> {
  return atualizarItem(id, { status })
}

export async function excluirItem(id: number): Promise<void> {
  // .select() devolve as linhas apagadas: se vier vazio, nada foi excluído
  // (item inexistente ou bloqueado pelas políticas RLS)
  const { data, error } = await supabase
    .from(TABELA_ITENS)
    .delete()
    .eq("id", id)
    .select("id")

  if (error) throw criarErro("excluir o item", error)
  if (data.length === 0) throw new Error("Não foi possível excluir o item: ele não existe ou não há permissão.")
}
