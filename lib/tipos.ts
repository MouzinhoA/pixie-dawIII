// Tipos da aplicação. Os nomes dos campos seguem as colunas da tabela "produtos"
// do Supabase, assim não é preciso converter os dados ao ler ou gravar.

// Os valores seguem os que o app Pixie Mobile já grava no banco compartilhado:
// "disponivel" é o anúncio publicado, visível para os compradores.
export type StatusAnuncio = "rascunho" | "disponivel" | "pausado" | "vendido"

export type CondicaoItem = "lacrado" | "novo" | "usado" | "com_avarias"

export interface Categoria {
  id: number
  nome: string
}

// Entidade principal: um item da coleção do vendedor
export interface ItemColecao {
  id: number
  titulo: string
  descricao: string
  categoria_id: number
  marca: string | null
  condicao: CondicaoItem
  preco: number
  quantidade: number
  imagens: string[] | null
  status: StatusAnuncio
  criado_em: string
}

// Dados que o usuário preenche no formulário (sem id e sem data, que o banco gera)
export type DadosItem = Omit<ItemColecao, "id" | "criado_em">

// Textos exibidos na interface para cada valor guardado no banco
export const NOMES_STATUS: Record<StatusAnuncio, string> = {
  rascunho: "Rascunho",
  disponivel: "Publicado",
  pausado: "Pausado",
  vendido: "Vendido",
}

export const NOMES_CONDICAO: Record<CondicaoItem, string> = {
  lacrado: "Lacrado",
  novo: "Novo",
  usado: "Usado",
  com_avarias: "Com avarias",
}

export const LISTA_STATUS = Object.keys(NOMES_STATUS) as StatusAnuncio[]
export const LISTA_CONDICOES = Object.keys(NOMES_CONDICAO) as CondicaoItem[]

// Opções de ordenação da listagem: coluna do banco + direção
export type OrdenacaoItens =
  | "recentes"
  | "antigos"
  | "nome"
  | "menor_preco"
  | "maior_preco"

export interface FiltrosItens {
  busca: string
  categoriaId: number | null
  status: StatusAnuncio | null
  ordenacao: OrdenacaoItens
}
