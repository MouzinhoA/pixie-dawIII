"use client"

import { useRouter } from "next/navigation"
import { useAvisos } from "@/components/Avisos"
import { FormularioItem } from "@/components/FormularioItem"
import { cadastrarItem } from "@/lib/servicoItens"
import type { DadosItem } from "@/lib/tipos"

export default function PaginaNovoItem() {
  const router = useRouter()
  const mostrarAviso = useAvisos()

  async function salvarNovoItem(dados: DadosItem) {
    try {
      const itemCriado = await cadastrarItem(dados)
      mostrarAviso("sucesso", `"${itemCriado.titulo}" cadastrado com sucesso.`)
      router.push(`/itens/${itemCriado.id}`)
    } catch (erro) {
      mostrarAviso("erro", (erro as Error).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo item</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um item da sua coleção. Campos com <span className="text-destructive">*</span> são obrigatórios.
        </p>
      </div>
      <FormularioItem textoBotao="Cadastrar item" enderecoCancelar="/itens" aoSalvar={salvarNovoItem} />
    </div>
  )
}
