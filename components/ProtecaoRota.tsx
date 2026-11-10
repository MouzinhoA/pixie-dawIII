"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Carregando } from "@/components/Estados"
import { supabase } from "@/lib/supabase"

export const ROTAS_PUBLICAS = ["/login", "/cadastro"]

export function ProtecaoRota({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const caminhoAtual = usePathname()
  const [logado, setLogado] = useState<boolean | null>(null)
  const rotaPublica = ROTAS_PUBLICAS.includes(caminhoAtual)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLogado(Boolean(data.session)))
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => setLogado(Boolean(sessao)))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (logado === false && !rotaPublica) router.replace("/login")
    if (logado === true && rotaPublica) router.replace("/")
  }, [logado, rotaPublica, router])

  if (rotaPublica) return children
  if (!logado) return <Carregando texto="Verificando acesso..." />
  return children
}
