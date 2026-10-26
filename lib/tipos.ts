export type StatusAnuncio = "rascunho" | "disponivel" | "pausado" | "vendido"

export type CondicaoItem = "lacrado" | "novo" | "usado" | "com_avarias"

export interface Categoria {
  id: number
  nome: string
}

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

export type DadosItem = Omit<ItemColecao, "id" | "criado_em">

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
