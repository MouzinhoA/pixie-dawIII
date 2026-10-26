"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Carregando, ListaVazia, MensagemErro } from "@/components/Estados"
import { EtiquetaStatus } from "@/components/EtiquetaStatus"
import { buttonVariants } from "@/components/ui/button"
import { formatarPreco } from "@/lib/formatacao"
import { buscarItens } from "@/lib/servicoItens"
import { LISTA_STATUS, type ItemColecao, type StatusAnuncio } from "@/lib/tipos"

function calcularResumo(itens: ItemColecao[]) {
  const totalPorStatus = Object.fromEntries(LISTA_STATUS.map((status) => [status, 0])) as Record<StatusAnuncio, number>
  let valorEmAnuncio = 0
  let valorVendido = 0

  for (const item of itens) {
    totalPorStatus[item.status] = (totalPorStatus[item.status] ?? 0) + 1
    if (item.status === "disponivel") valorEmAnuncio += item.preco * item.quantidade
    if (item.status === "vendido") valorVendido += item.preco * item.quantidade
  }

  return { totalPorStatus, valorEmAnuncio, valorVendido }
}

export default function PaginaPainel() {
  const [itens, setItens] = useState<ItemColecao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      setMensagemErro(null)
      try {
        setItens(await buscarItens())
      } catch (erro) {
        setMensagemErro((erro as Error).message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [tentativa])

  if (carregando) return <Carregando texto="Carregando painel..." />
  if (mensagemErro) return <MensagemErro texto={mensagemErro} aoTentarNovamente={() => setTentativa((n) => n + 1)} />

  const { totalPorStatus, valorEmAnuncio, valorVendido } = calcularResumo(itens)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painel do vendedor</h1>
          <p className="text-sm text-muted-foreground">Resumo da sua coleção e dos seus anúncios.</p>
        </div>
        <Link href="/itens/novo" className={buttonVariants()}>
          <Plus /> Novo item
        </Link>
      </div>

      {itens.length === 0 ? (
        <ListaVazia titulo="Nenhum item cadastrado ainda.">
          <p className="text-sm text-muted-foreground">Cadastre seu primeiro colecionável para ver o resumo aqui.</p>
        </ListaVazia>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <CartaoResumo titulo="Itens cadastrados" valor={itens.length} />
            {LISTA_STATUS.map((status) => (
              <CartaoResumo key={status} titulo={status === "vendido" ? "Itens" : "Anúncios"} valor={totalPorStatus[status]}>
                <EtiquetaStatus status={status} />
              </CartaoResumo>
            ))}
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <CartaoResumo titulo="Valor em anúncios publicados" valor={formatarPreco(valorEmAnuncio)} />
            <CartaoResumo titulo="Valor de itens vendidos" valor={formatarPreco(valorVendido)} />
          </section>
        </>
      )}
    </div>
  )
}

function CartaoResumo({
  titulo,
  valor,
  children,
}: {
  titulo: string
  valor: string | number
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{titulo}</span>
        {children}
      </div>
      <span className="text-2xl font-semibold tabular-nums">{valor}</span>
    </div>
  )
}
