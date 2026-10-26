"use client"

import { useState } from "react"
import { CircleCheckBig, LoaderCircle, Pause, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ItemColecao, StatusAnuncio } from "@/lib/tipos"
import { motivoBloqueioPublicacao, proximosStatus } from "@/lib/validacao"

const ACOES: Record<StatusAnuncio, { texto: string; Icone: typeof Send }> = {
  disponivel: { texto: "Publicar", Icone: Send },
  pausado: { texto: "Pausar anúncio", Icone: Pause },
  vendido: { texto: "Marcar como vendido", Icone: CircleCheckBig },
  rascunho: { texto: "Voltar para rascunho", Icone: Pause },
}

interface PropsAcoesStatus {
  item: ItemColecao
  aoAlterar: (novoStatus: StatusAnuncio) => Promise<void>
}

export function AcoesStatus({ item, aoAlterar }: PropsAcoesStatus) {
  const [statusEmAndamento, setStatusEmAndamento] = useState<StatusAnuncio | null>(null)
  const opcoes = proximosStatus(item.status)

  async function alterar(novoStatus: StatusAnuncio) {
    setStatusEmAndamento(novoStatus)
    try {
      await aoAlterar(novoStatus)
    } finally {
      setStatusEmAndamento(null)
    }
  }

  if (opcoes.length === 0) {
    return <p className="text-sm text-muted-foreground">Venda concluída. Para anunciar de novo, edite o item.</p>
  }

  const bloqueioPublicacao = motivoBloqueioPublicacao(item)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {opcoes.map((status) => {
          const { texto, Icone } = ACOES[status]
          const bloqueado = status === "disponivel" && bloqueioPublicacao !== null
          return (
            <Button
              key={status}
              variant={status === "disponivel" ? "default" : "outline"}
              disabled={statusEmAndamento !== null || bloqueado}
              onClick={() => alterar(status)}
            >
              {statusEmAndamento === status ? <LoaderCircle className="animate-spin" /> : <Icone />}
              {texto}
            </Button>
          )
        })}
      </div>
      {opcoes.includes("disponivel") && bloqueioPublicacao && (
        <p className="text-xs text-muted-foreground">{bloqueioPublicacao} Edite o item para corrigir.</p>
      )}
    </div>
  )
}
