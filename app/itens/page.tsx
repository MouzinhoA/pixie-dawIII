"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Search, X } from "lucide-react"
import { CampoSelecao } from "@/components/CampoSelecao"
import { Carregando, ListaVazia, MensagemErro } from "@/components/Estados"
import { ListaItens } from "@/components/ListaItens"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buscarCategorias, buscarItens } from "@/lib/servicoItens"
import {
  LISTA_STATUS,
  NOMES_STATUS,
  type Categoria,
  type FiltrosItens,
  type ItemColecao,
  type OrdenacaoItens,
  type StatusAnuncio,
} from "@/lib/tipos"

const FILTROS_INICIAIS: FiltrosItens = {
  busca: "",
  categoriaId: null,
  status: null,
  ordenacao: "recentes",
}

const OPCOES_ORDENACAO: { valor: OrdenacaoItens; texto: string }[] = [
  { valor: "recentes", texto: "Mais recentes" },
  { valor: "antigos", texto: "Mais antigos" },
  { valor: "nome", texto: "Nome (A–Z)" },
  { valor: "menor_preco", texto: "Menor preço" },
  { valor: "maior_preco", texto: "Maior preço" },
]

const ESPERA_BUSCA_MS = 300

export default function PaginaListaItens() {
  const [filtros, setFiltros] = useState<FiltrosItens>(FILTROS_INICIAIS)
  const [itens, setItens] = useState<ItemColecao[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    buscarCategorias()
      .then(setCategorias)
      .catch((erro: Error) => setMensagemErro(erro.message))
  }, [])

  useEffect(() => {
    let respostaDescartada = false

    const temporizador = setTimeout(async () => {
      setCarregando(true)
      setMensagemErro(null)
      try {
        const resultado = await buscarItens(filtros)
        if (!respostaDescartada) setItens(resultado)
      } catch (erro) {
        if (!respostaDescartada) setMensagemErro((erro as Error).message)
      } finally {
        if (!respostaDescartada) setCarregando(false)
      }
    }, ESPERA_BUSCA_MS)

    return () => {
      respostaDescartada = true
      clearTimeout(temporizador)
    }
  }, [filtros, tentativa])

  const nomesCategorias = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria.nome])),
    [categorias]
  )

  function alterarFiltro<Campo extends keyof FiltrosItens>(campo: Campo, valor: FiltrosItens[Campo]) {
    setFiltros((atuais) => ({ ...atuais, [campo]: valor }))
  }

  const temFiltroAtivo = filtros.busca !== "" || filtros.categoriaId !== null || filtros.status !== null

  function renderizarConteudo() {
    if (mensagemErro) {
      return <MensagemErro texto={mensagemErro} aoTentarNovamente={() => setTentativa((n) => n + 1)} />
    }
    if (carregando) return <Carregando texto="Carregando itens..." />
    if (itens.length === 0 && temFiltroAtivo) {
      return (
        <ListaVazia titulo="Nenhum item encontrado com esses filtros.">
          <Button variant="outline" onClick={() => setFiltros(FILTROS_INICIAIS)}>
            Limpar filtros
          </Button>
        </ListaVazia>
      )
    }
    if (itens.length === 0) {
      return (
        <ListaVazia titulo="Você ainda não cadastrou nenhum item.">
          <Link href="/itens/novo" className={buttonVariants()}>
            <Plus /> Cadastrar primeiro item
          </Link>
        </ListaVazia>
      )
    }
    return <ListaItens itens={itens} nomesCategorias={nomesCategorias} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meus itens</h1>
          <p className="text-sm text-muted-foreground">
            {carregando ? "Atualizando..." : `${itens.length} ${itens.length === 1 ? "item" : "itens"}`}
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Buscar pelo nome</span>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pelo nome..."
            value={filtros.busca}
            onChange={(evento) => alterarFiltro("busca", evento.target.value)}
            className="bg-background pl-8"
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por categoria</span>
          <CampoSelecao
            value={filtros.categoriaId ?? ""}
            onChange={(evento) =>
              alterarFiltro("categoriaId", evento.target.value ? Number(evento.target.value) : null)
            }
          >
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </CampoSelecao>
        </label>

        <label>
          <span className="sr-only">Filtrar por status</span>
          <CampoSelecao
            value={filtros.status ?? ""}
            onChange={(evento) =>
              alterarFiltro("status", (evento.target.value || null) as StatusAnuncio | null)
            }
          >
            <option value="">Todos os status</option>
            {LISTA_STATUS.map((status) => (
              <option key={status} value={status}>
                {NOMES_STATUS[status]}
              </option>
            ))}
          </CampoSelecao>
        </label>

        <label>
          <span className="sr-only">Ordenar por</span>
          <CampoSelecao
            value={filtros.ordenacao}
            onChange={(evento) => alterarFiltro("ordenacao", evento.target.value as OrdenacaoItens)}
          >
            {OPCOES_ORDENACAO.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.texto}
              </option>
            ))}
          </CampoSelecao>
        </label>

        <Button
          variant="ghost"
          disabled={!temFiltroAtivo}
          onClick={() => setFiltros({ ...FILTROS_INICIAIS, ordenacao: filtros.ordenacao })}
        >
          <X /> Limpar
        </Button>
      </div>

      {renderizarConteudo()}
    </div>
  )
}
