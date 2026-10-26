"use client"

import { useEffect, useState } from "react"
import { buscarItemPorId } from "@/lib/servicoItens"
import type { ItemColecao } from "@/lib/tipos"

export function useCarregarItem(idTexto: string) {
  const [item, setItem] = useState<ItemColecao | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let respostaDescartada = false
    const id = Number(idTexto)

    async function carregar() {
      setCarregando(true)
      setMensagemErro(null)
      try {
        if (!Number.isInteger(id) || id <= 0) throw new Error("Item não encontrado: endereço inválido.")
        const resultado = await buscarItemPorId(id)
        if (!respostaDescartada) setItem(resultado)
      } catch (erro) {
        if (!respostaDescartada) setMensagemErro((erro as Error).message)
      } finally {
        if (!respostaDescartada) setCarregando(false)
      }
    }

    carregar()
    return () => {
      respostaDescartada = true
    }
  }, [idTexto, tentativa])

  return {
    item,
    setItem,
    carregando,
    mensagemErro,
    recarregar: () => setTentativa((n) => n + 1),
  }
}
