"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { LoaderCircle, SendHorizontal } from "lucide-react"
import { useAvisos } from "@/components/Avisos"
import { Carregando, MensagemErro } from "@/components/Estados"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buscarIdVendedorLogado } from "@/lib/autenticacao"
import { formatarDataHora } from "@/lib/formatacao"
import { adicionarSemDuplicar, buscarMensagens, enviarMensagem, escutarMensagens } from "@/lib/servicoChat"
import type { Mensagem } from "@/lib/tipos"

interface ChatInteresseProps {
  interesseId: number
  nomeComprador: string
  podeEnviar: boolean
}

export function ChatInteresse({ interesseId, nomeComprador, podeEnviar }: ChatInteresseProps) {
  const mostrarAviso = useAvisos()
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [meuId, setMeuId] = useState<string | null>(null)
  const [texto, setTexto] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const caixaMensagens = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pararDeEscutar = escutarMensagens(interesseId, (nova) =>
      setMensagens((atuais) => adicionarSemDuplicar(atuais, nova))
    )

    async function carregar() {
      setCarregando(true)
      setMensagemErro(null)
      try {
        const [historico, idLogado] = await Promise.all([buscarMensagens(interesseId), buscarIdVendedorLogado()])
        setMeuId(idLogado)
        setMensagens((atuais) => historico.reduce(adicionarSemDuplicar, atuais))
      } catch (erro) {
        setMensagemErro((erro as Error).message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()

    return pararDeEscutar
  }, [interesseId, tentativa])

  useEffect(() => {
    const caixa = caixaMensagens.current
    if (caixa) caixa.scrollTop = caixa.scrollHeight
  }, [mensagens])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setEnviando(true)
    try {
      const enviada = await enviarMensagem(interesseId, conteudo)
      setMensagens((atuais) => adicionarSemDuplicar(atuais, enviada))
      setTexto("")
    } catch (erro) {
      mostrarAviso("erro", (erro as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) return <Carregando texto="Carregando conversa..." />
  if (mensagemErro) return <MensagemErro texto={mensagemErro} aoTentarNovamente={() => setTentativa((n) => n + 1)} />

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border bg-muted/30 p-3">
      <div ref={caixaMensagens} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1" aria-live="polite">
        {mensagens.length === 0 ? (
          <p className="m-auto py-4 text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Mande um oi para {nomeComprador}!
          </p>
        ) : (
          mensagens.map((mensagem) => {
            const minha = mensagem.autor_id === meuId
            return (
              <div
                key={mensagem.id}
                className={
                  "flex max-w-[80%] flex-col gap-0.5 rounded-lg px-3 py-2 text-sm " +
                  (minha ? "self-end bg-primary text-primary-foreground" : "self-start bg-background ring-1 ring-border")
                }
              >
                <span className="whitespace-pre-wrap break-words">{mensagem.conteudo}</span>
                <span className={"text-[10px] " + (minha ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {minha ? "Você" : nomeComprador} · {formatarDataHora(mensagem.criado_em)}
                </span>
              </div>
            )
          })
        )}
      </div>

      {podeEnviar ? (
        <form onSubmit={enviar} className="flex gap-2">
          <Input
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            placeholder={`Mensagem para ${nomeComprador}`}
            maxLength={1000}
            aria-label="Mensagem"
            disabled={enviando}
          />
          <Button type="submit" size="sm" disabled={enviando || !texto.trim()}>
            {enviando ? <LoaderCircle className="animate-spin" /> : <SendHorizontal />}
            Enviar
          </Button>
        </form>
      ) : (
        <p className="text-center text-xs text-muted-foreground">Negociação encerrada. A conversa está só para leitura.</p>
      )}
    </div>
  )
}
