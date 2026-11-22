"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ChatInteresse } from "@/components/ChatInteresse"
import { Carregando, MensagemErro } from "@/components/Estados"
import { MiniaturaItem } from "@/components/ListaItens"
import { buttonVariants } from "@/components/ui/button"
import { useCarregarItem } from "@/hooks/useCarregarItem"
import { formatarPreco } from "@/lib/formatacao"
import { buscarInteressesDoItem } from "@/lib/servicoItens"
import { NOMES_STATUS_INTERESSE, NOMES_TIPO_INTERESSE, type InteresseRecebido } from "@/lib/tipos"

export default function PaginaConversa({ params }: PageProps<"/itens/[id]/conversas/[interesseId]">) {
  const { id, interesseId } = use(params)
  const { item, carregando: carregandoItem, mensagemErro: erroItem, recarregar } = useCarregarItem(id)
  const [interesse, setInteresse] = useState<InteresseRecebido | null>(null)
  const [carregandoInteresse, setCarregandoInteresse] = useState(true)
  const [erroInteresse, setErroInteresse] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let respostaDescartada = false

    async function carregar() {
      setCarregandoInteresse(true)
      setErroInteresse(null)
      try {
        const interesses = await buscarInteressesDoItem(Number(id))
        const encontrado = interesses.find((i) => i.id === Number(interesseId))
        if (!encontrado) throw new Error("Conversa não encontrada para este item.")
        if (encontrado.status === "aguardando")
          throw new Error("Aceite a proposta do comprador antes de iniciar a conversa.")
        if (!respostaDescartada) setInteresse(encontrado)
      } catch (erro) {
        if (!respostaDescartada) setErroInteresse((erro as Error).message)
      } finally {
        if (!respostaDescartada) setCarregandoInteresse(false)
      }
    }

    carregar()
    return () => {
      respostaDescartada = true
    }
  }, [id, interesseId, tentativa])

  const linkVoltar = (
    <Link href={`/itens/${id}`} className={buttonVariants({ variant: "ghost", className: "-ml-2 self-start" })}>
      <ArrowLeft /> Voltar para o item
    </Link>
  )

  if (carregandoItem || carregandoInteresse) return <Carregando texto="Carregando conversa..." />

  const mensagemErro = erroItem ?? erroInteresse
  if (mensagemErro || !item || !interesse) {
    return (
      <div className="flex flex-col gap-4">
        {linkVoltar}
        <MensagemErro
          texto={mensagemErro ?? "Conversa não encontrada."}
          aoTentarNovamente={() => {
            recarregar()
            setTentativa((n) => n + 1)
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-[28rem] flex-col gap-4">
      {linkVoltar}

      <div className="flex items-center gap-3 rounded-xl border p-3">
        <MiniaturaItem item={item} tamanho="size-14 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate font-semibold">Conversa com {interesse.comprador_nome}</h1>
          <p className="truncate text-sm text-muted-foreground">
            {item.titulo} · {formatarPreco(item.preco)}
          </p>
          <p className="text-xs text-muted-foreground">
            {NOMES_TIPO_INTERESSE[interesse.tipo] ?? interesse.tipo}
            {interesse.tipo === "compra" && interesse.valor_oferecido !== null &&
              ` por ${formatarPreco(interesse.valor_oferecido)}`}
            {interesse.tipo === "troca" && interesse.item_troca && `: ${interesse.item_troca}`}
            {" · "}
            {NOMES_STATUS_INTERESSE[interesse.status] ?? interesse.status}
          </p>
        </div>
      </div>

      <ChatInteresse
        interesseId={interesse.id}
        nomeComprador={interesse.comprador_nome}
        podeEnviar={interesse.status === "negociando"}
      />
    </div>
  )
}
