"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { AcoesStatus } from "@/components/AcoesStatus"
import { useAvisos } from "@/components/Avisos"
import { ConfirmarExclusao } from "@/components/ConfirmarExclusao"
import { Carregando, MensagemErro } from "@/components/Estados"
import { EtiquetaStatus } from "@/components/EtiquetaStatus"
import { MiniaturaItem } from "@/components/ListaItens"
import { buttonVariants } from "@/components/ui/button"
import { useCarregarItem } from "@/hooks/useCarregarItem"
import { formatarData, formatarPreco } from "@/lib/formatacao"
import { alterarStatus, buscarCategorias, excluirItem } from "@/lib/servicoItens"
import { NOMES_CONDICAO, NOMES_STATUS, type StatusAnuncio } from "@/lib/tipos"

export default function PaginaDetalhesItem({ params }: PageProps<"/itens/[id]">) {
  const { id } = use(params)
  const router = useRouter()
  const mostrarAviso = useAvisos()
  const { item, setItem, carregando, mensagemErro, recarregar } = useCarregarItem(id)
  const [nomeCategoria, setNomeCategoria] = useState<string | null>(null)

  useEffect(() => {
    if (!item) return
    buscarCategorias()
      .then((categorias) => {
        const categoria = categorias.find((c) => c.id === item.categoria_id)
        setNomeCategoria(categoria?.nome ?? "Sem categoria")
      })
      .catch(() => setNomeCategoria("—"))
  }, [item])

  async function mudarStatus(novoStatus: StatusAnuncio) {
    if (!item) return
    try {
      const itemAtualizado = await alterarStatus(item.id, novoStatus)
      setItem(itemAtualizado)
      mostrarAviso("sucesso", `Anúncio agora está "${NOMES_STATUS[novoStatus]}".`)
    } catch (erro) {
      mostrarAviso("erro", (erro as Error).message)
    }
  }

  async function confirmarExclusao(): Promise<boolean> {
    if (!item) return false
    try {
      await excluirItem(item.id)
      mostrarAviso("sucesso", `"${item.titulo}" foi excluído.`)
      router.push("/itens")
      return true
    } catch (erro) {
      mostrarAviso("erro", (erro as Error).message)
      return false
    }
  }

  const linkVoltar = (
    <Link href="/itens" className={buttonVariants({ variant: "ghost", className: "-ml-2 self-start" })}>
      <ArrowLeft /> Voltar para a lista
    </Link>
  )

  if (carregando) return <Carregando texto="Carregando item..." />
  if (mensagemErro || !item) {
    return (
      <div className="flex flex-col gap-4">
        {linkVoltar}
        <MensagemErro texto={mensagemErro ?? "Item não encontrado."} aoTentarNovamente={recarregar} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {linkVoltar}

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <MiniaturaItem item={item} tamanho="aspect-square w-full" />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <EtiquetaStatus status={item.status} />
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{item.titulo}</h1>
            <p className="text-3xl font-semibold text-primary tabular-nums">{formatarPreco(item.preco)}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border p-4 text-sm sm:grid-cols-3">
            <Informacao rotulo="Categoria" valor={nomeCategoria ?? "..."} />
            <Informacao rotulo="Marca / fabricante" valor={item.marca || "Não informada"} />
            <Informacao rotulo="Conservação" valor={NOMES_CONDICAO[item.condicao] ?? item.condicao} />
            <Informacao rotulo="Quantidade" valor={`${item.quantidade} un.`} />
            <Informacao rotulo="Cadastrado em" valor={formatarData(item.criado_em)} />
            <Informacao rotulo="Código" valor={`#${item.id}`} />
          </dl>

          <div>
            <h2 className="mb-1 text-sm font-medium">Descrição</h2>
            <p className="text-sm whitespace-pre-line text-muted-foreground">{item.descricao}</p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
            <h2 className="text-sm font-medium">Gerenciar anúncio</h2>
            <AcoesStatus item={item} aoAlterar={mudarStatus} />
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Link href={`/itens/${item.id}/editar`} className={buttonVariants({ variant: "outline" })}>
              <Pencil /> Editar
            </Link>
            <ConfirmarExclusao nomeItem={item.titulo} aoConfirmar={confirmarExclusao} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Informacao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="font-medium">{valor}</dd>
    </div>
  )
}
