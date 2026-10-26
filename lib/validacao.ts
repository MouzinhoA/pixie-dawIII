import {
  LISTA_CONDICOES,
  LISTA_STATUS,
  type CondicaoItem,
  type DadosItem,
  type ItemColecao,
  type StatusAnuncio,
} from "@/lib/tipos"


export interface ValoresFormulario {
  titulo: string
  descricao: string
  categoria_id: string
  marca: string
  condicao: string
  preco: string
  quantidade: string
  imagem: string
  status: string
}

export type ErrosFormulario = Partial<Record<keyof ValoresFormulario, string>>

export const PRECO_MAXIMO = 1_000_000
export const QUANTIDADE_MAXIMA = 9999

export function converterPreco(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, "")
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo
  return normalizado === "" ? NaN : Number(normalizado)
}

function ehUrlValida(texto: string): boolean {
  try {
    const url = new URL(texto)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false 
  }
}

export function validarItem(valores: ValoresFormulario): {
  erros: ErrosFormulario
  dados: DadosItem | null
} {
  const erros: ErrosFormulario = {}
  const titulo = valores.titulo.trim()
  const descricao = valores.descricao.trim()
  const marca = valores.marca.trim()
  const imagem = valores.imagem.trim()
  const preco = converterPreco(valores.preco)
  const quantidade = Number(valores.quantidade)

  if (!titulo) erros.titulo = "Informe o nome do item."
  else if (titulo.length < 3) erros.titulo = "O nome deve ter pelo menos 3 caracteres."
  else if (titulo.length > 100) erros.titulo = "O nome deve ter no máximo 100 caracteres."

  if (!descricao) erros.descricao = "Informe uma descrição."
  else if (descricao.length < 10) erros.descricao = "Descreva o item com pelo menos 10 caracteres."
  else if (descricao.length > 1000) erros.descricao = "A descrição deve ter no máximo 1000 caracteres."

  if (!valores.categoria_id) erros.categoria_id = "Escolha uma categoria."

  if (marca.length > 60) erros.marca = "A marca deve ter no máximo 60 caracteres."

  if (!LISTA_CONDICOES.includes(valores.condicao as CondicaoItem))
    erros.condicao = "Escolha o estado de conservação."

  if (valores.preco.trim() === "") erros.preco = "Informe o preço."
  else if (Number.isNaN(preco)) erros.preco = "Preço inválido. Use números, ex.: 149,90."
  else if (preco < 0) erros.preco = "O preço não pode ser negativo."
  else if (preco > PRECO_MAXIMO) erros.preco = "O preço máximo é R$ 1.000.000,00."
  // compara com tolerância porque 149.9 * 100 dá 14990.000000000002 em ponto flutuante
  else if (Math.abs(preco * 100 - Math.round(preco * 100)) > 1e-6) erros.preco = "Use no máximo 2 casas decimais."

  if (valores.quantidade.trim() === "") erros.quantidade = "Informe a quantidade."
  else if (!Number.isInteger(quantidade)) erros.quantidade = "A quantidade deve ser um número inteiro."
  else if (quantidade < 0) erros.quantidade = "A quantidade não pode ser negativa."
  else if (quantidade > QUANTIDADE_MAXIMA) erros.quantidade = `A quantidade máxima é ${QUANTIDADE_MAXIMA}.`

  if (imagem && !ehUrlValida(imagem))
    erros.imagem = "Informe um endereço começando com http:// ou https://."

  if (!LISTA_STATUS.includes(valores.status as StatusAnuncio)) erros.status = "Escolha o status."

  if (valores.status === "disponivel" && !erros.preco && !erros.quantidade) {
    const bloqueio = motivoBloqueioPublicacao({ preco, quantidade })
    if (bloqueio) erros.status = bloqueio
  }

  if (Object.keys(erros).length > 0) return { erros, dados: null }

  return {
    erros,
    dados: {
      titulo,
      descricao,
      categoria_id: Number(valores.categoria_id),
      marca: marca || null,
      condicao: valores.condicao as CondicaoItem,
      preco,
      quantidade,
      imagens: imagem ? [imagem] : [],
      status: valores.status as StatusAnuncio,
    },
  }
}

export function itemParaFormulario(item?: ItemColecao): ValoresFormulario {
  return {
    titulo: item?.titulo ?? "",
    descricao: item?.descricao ?? "",
    categoria_id: item ? String(item.categoria_id) : "",
    marca: item?.marca ?? "",
    condicao: item?.condicao ?? "",
    preco: item ? String(item.preco).replace(".", ",") : "",
    quantidade: item ? String(item.quantidade) : "1",
    imagem: item?.imagens?.[0] ?? "",
    status: item?.status ?? "rascunho",
  }
}

const TRANSICOES_STATUS: Record<StatusAnuncio, StatusAnuncio[]> = {
  rascunho: ["disponivel"],
  disponivel: ["pausado", "vendido"],
  pausado: ["disponivel", "vendido"],
  vendido: [], 
}

export function proximosStatus(statusAtual: StatusAnuncio): StatusAnuncio[] {
  return TRANSICOES_STATUS[statusAtual] ?? []
}

export function motivoBloqueioPublicacao(item: { preco: number; quantidade: number }): string | null {
  if (item.preco <= 0) return "Para publicar, o preço precisa ser maior que zero."
  if (item.quantidade < 1) return "Para publicar, é preciso ter pelo menos 1 unidade."
  return null
}
