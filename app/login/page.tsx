"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { entrar } from "@/lib/autenticacao"

export default function PaginaLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)

  async function enviarFormulario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!email.trim() || !senha) {
      setMensagemErro("Informe o e-mail e a senha.")
      return
    }

    setEntrando(true)
    setMensagemErro(null)
    try {
      await entrar(email.trim(), senha)
      router.replace("/")
    } catch (erro) {
      setMensagemErro((erro as Error).message)
      setEntrando(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-8 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/logo-pixie.png" alt="Pixie" width={360} height={188} priority className="h-14 w-auto" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrar no Pixie Seller</h1>
          <p className="text-sm text-muted-foreground">Acesse o painel para gerenciar seus anúncios.</p>
        </div>
      </div>

      <form onSubmit={enviarFormulario} noValidate className="grid gap-4 rounded-xl border p-4 sm:p-6">
        <div className="grid gap-1.5">
          <Label htmlFor="campo-email">E-mail</Label>
          <Input
            id="campo-email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            disabled={entrando}
            aria-invalid={mensagemErro ? true : undefined}
            onChange={(evento) => setEmail(evento.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="campo-senha">Senha</Label>
          <Input
            id="campo-senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            disabled={entrando}
            aria-invalid={mensagemErro ? true : undefined}
            onChange={(evento) => setSenha(evento.target.value)}
          />
        </div>

        {mensagemErro && (
          <p role="alert" className="text-sm text-destructive">
            {mensagemErro}
          </p>
        )}

        <Button type="submit" size="lg" disabled={entrando}>
          {entrando && <LoaderCircle className="animate-spin" />}
          {entrando ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  )
}
