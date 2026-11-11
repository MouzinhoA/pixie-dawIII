"use client"

import { useEffect, useState } from "react"
import { Check, Handshake, LoaderCircle, X } from "lucide-react"
import { useAvisos } from "@/components/Avisos"
import { Carregando, MensagemErro } from "@/components/Estados"
import { Button } from "@/components/ui/button"
import { formatarData, formatarPreco } from "@/lib/formatacao"
import { buscarInteressesDoItem, responderInteresse } from "@/lib/servicoItens"
import {
  NOMES_STATUS_INTERESSE,
  NOMES_TIPO_INTERESSE,
  type InteresseRecebido,
  type StatusInteresse,
} from "@/lib/tipos"

const CORES_STATUS_INTERESSE: Record<StatusInteresse, string> = {
  aguardando: "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  negociando: "bg-violet-50 text-violet-700 ring-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800",
  encerrado: "bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
}

const AVISOS_RESPOSTA: Record<Exclude<StatusInteresse, "aguardando">, (nome: string) => string> = {
  negociando: (nome) => `Proposta de ${nome} aceita. Agora vocês estão em negociação.`,
  encerrado: (nome) => `Interesse de ${nome} encerrado.`,
}

export function InteressesItem({ itemId }: { itemId: number }) {
  const mostrarAviso = useAvisos()
  const [interesses, setInteresses] = useState<InteresseRecebido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      setMensagemErro(null)
      try {
        setInteresses(await buscarInteressesDoItem(itemId))
      } catch (erro) {
        setMensagemErro((erro as Error).message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [itemId, tentativa])

  async function responder(interesse: InteresseRecebido, novoStatus: "negociando" | "encerrado") {
    try {
      await responderInteresse(interesse.id, novoStatus)
      setInteresses((atuais) => atuais.map((i) => (i.id === interesse.id ? { ...i, status: novoStatus } : i)))
      mostrarAviso("sucesso", AVISOS_RESPOSTA[novoStatus](interesse.comprador_nome))
    } catch (erro) {
      mostrarAviso("erro", (erro as Error).message)
    }
  }

  const aguardando = interesses.filter((interesse) => interesse.status === "aguardando").length

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Interessados</h2>
        {aguardando > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {aguardando} {aguardando === 1 ? "aguardando resposta" : "aguardando respostas"}
          </span>
        )}
      </div>

      {carregando ? (
        <Carregando texto="Carregando interessados..." />
      ) : mensagemErro ? (
        <MensagemErro texto={mensagemErro} aoTentarNovamente={() => setTentativa((n) => n + 1)} />
      ) : interesses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ninguém demonstrou interesse neste item ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {interesses.map((interesse) => (
            <CartaoInteresse key={interesse.id} interesse={interesse} aoResponder={responder} />
          ))}
        </ul>
      )}
    </div>
  )
}

function CartaoInteresse({
  interesse,
  aoResponder,
}: {
  interesse: InteresseRecebido
  aoResponder: (interesse: InteresseRecebido, novoStatus: "negociando" | "encerrado") => Promise<void>
}) {
  const [respondendo, setRespondendo] = useState<"negociando" | "encerrado" | null>(null)

  async function responder(novoStatus: "negociando" | "encerrado", pergunta?: string) {
    if (pergunta && !window.confirm(pergunta)) return
    setRespondendo(novoStatus)
    try {
      await aoResponder(interesse, novoStatus)
    } finally {
      setRespondendo(null)
    }
  }

  return (
    <li
      className={
        "flex flex-col gap-3 rounded-lg border bg-background p-3 " +
        (interesse.status === "aguardando" ? "border-amber-300 dark:border-amber-800" : "")
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{interesse.comprador_nome}</span>
          <span className="text-xs text-muted-foreground">
            {NOMES_TIPO_INTERESSE[interesse.tipo] ?? interesse.tipo} · enviado em {formatarData(interesse.criado_em)}
          </span>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CORES_STATUS_INTERESSE[interesse.status] ?? CORES_STATUS_INTERESSE.encerrado}`}
        >
          {NOMES_STATUS_INTERESSE[interesse.status] ?? interesse.status}
        </span>
      </div>

      <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3 text-sm">
        {interesse.tipo === "compra" && interesse.valor_oferecido !== null && (
          <p className="font-semibold">Ofereceu {formatarPreco(interesse.valor_oferecido)}</p>
        )}
        {interesse.tipo === "troca" && interesse.item_troca && (
          <p className="font-semibold">Oferece em troca: {interesse.item_troca}</p>
        )}
        {interesse.mensagem && <p className="text-muted-foreground italic">“{interesse.mensagem}”</p>}
      </div>

      {interesse.status === "aguardando" && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={respondendo !== null} onClick={() => responder("negociando")}>
            {respondendo === "negociando" ? <LoaderCircle className="animate-spin" /> : <Check />}
            Aceitar proposta
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={respondendo !== null}
            onClick={() => responder("encerrado", `Recusar o interesse de ${interesse.comprador_nome}?`)}
          >
            {respondendo === "encerrado" ? <LoaderCircle className="animate-spin" /> : <X />}
            Recusar
          </Button>
        </div>
      )}

      {interesse.status === "negociando" && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Handshake className="size-4" /> Combine os detalhes da venda com o comprador.
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={respondendo !== null}
            onClick={() => responder("encerrado", `Encerrar a negociação com ${interesse.comprador_nome}?`)}
          >
            {respondendo === "encerrado" ? <LoaderCircle className="animate-spin" /> : <X />}
            Encerrar negociação
          </Button>
        </div>
      )}
    </li>
  )
}
