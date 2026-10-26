"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useAvisos } from "@/components/Avisos"
import { Carregando, MensagemErro } from "@/components/Estados"
import { FormularioItem } from "@/components/FormularioItem"
import { useCarregarItem } from "@/hooks/useCarregarItem"
import { atualizarItem } from "@/lib/servicoItens"
import type { DadosItem } from "@/lib/tipos"

export default function PaginaEditarItem({ params }: PageProps<"/itens/[id]/editar">) {
  const { id } = use(params)
  const router = useRouter()
  const mostrarAviso = useAvisos()
  const { item, carregando, mensagemErro, recarregar } = useCarregarItem(id)

  async function salvarAlteracoes(dados: DadosItem) {
    if (!item) return
    try {
      await atualizarItem(item.id, dados)
      mostrarAviso("sucesso", "Alterações salvas com sucesso.")
      router.push(`/itens/${item.id}`)
    } catch (erro) {
      mostrarAviso("erro", (erro as Error).message)
    }
  }

  if (carregando) return <Carregando texto="Carregando item..." />
  if (mensagemErro || !item) {
    return <MensagemErro texto={mensagemErro ?? "Item não encontrado."} aoTentarNovamente={recarregar} />
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar item</h1>
        <p className="text-sm text-muted-foreground">{item.titulo}</p>
      </div>
      <FormularioItem
        key={item.id}
        itemInicial={item}
        textoBotao="Salvar alterações"
        enderecoCancelar={`/itens/${item.id}`}
        aoSalvar={salvarAlteracoes}
      />
    </div>
  )
}
