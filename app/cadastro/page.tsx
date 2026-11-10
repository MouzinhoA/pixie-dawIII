"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cadastrar } from "@/lib/autenticacao"
import { apenasDigitos, formatarCpf } from "@/lib/formatacao"
import { validarCadastro, type ErrosCadastro, type ValoresCadastro } from "@/lib/validacao"

const VALORES_INICIAIS: ValoresCadastro = { nome: "", cpf: "", email: "", senha: "", confirmarSenha: "" }

export default function PaginaCadastro() {
  const router = useRouter()
  const [valores, setValores] = useState<ValoresCadastro>(VALORES_INICIAIS)
  const [erros, setErros] = useState<ErrosCadastro>({})
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)
  const [cadastrando, setCadastrando] = useState(false)

  function alterarCampo(campo: keyof ValoresCadastro, valor: string) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  async function enviarFormulario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const novosErros = validarCadastro(valores)
    setErros(novosErros)
    setMensagemErro(null)
    if (Object.keys(novosErros).length > 0) {
      const primeiroCampo = Object.keys(novosErros)[0]
      document.getElementById(`campo-${primeiroCampo}`)?.focus()
      return
    }

    setCadastrando(true)
    try {
      await cadastrar(valores.nome.trim(), apenasDigitos(valores.cpf), valores.email.trim(), valores.senha)
      router.replace("/")
    } catch (erro) {
      setMensagemErro((erro as Error).message)
      setCadastrando(false)
    }
  }

  function propsCampo(campo: keyof ValoresCadastro) {
    return {
      id: `campo-${campo}`,
      name: campo,
      value: valores[campo],
      "aria-invalid": erros[campo] ? true : undefined,
      "aria-describedby": erros[campo] ? `erro-${campo}` : undefined,
      disabled: cadastrando,
      onChange: (evento: React.ChangeEvent<HTMLInputElement>) => alterarCampo(campo, evento.target.value),
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-8 sm:py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/logo-pixie.png" alt="Pixie" width={360} height={188} priority className="h-14 w-auto" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">Cadastre-se para anunciar seus colecionáveis.</p>
        </div>
      </div>

      <form onSubmit={enviarFormulario} noValidate className="grid gap-4 rounded-xl border p-4 sm:p-6">
        <Campo campo="nome" rotulo="Nome" erro={erros.nome}>
          <Input {...propsCampo("nome")} autoComplete="name" maxLength={80} placeholder="Seu nome" />
        </Campo>

        <Campo campo="cpf" rotulo="CPF" erro={erros.cpf}>
          <Input
            {...propsCampo("cpf")}
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            onChange={(evento) => alterarCampo("cpf", formatarCpf(evento.target.value))}
          />
        </Campo>

        <Campo campo="email" rotulo="E-mail" erro={erros.email}>
          <Input {...propsCampo("email")} type="email" autoComplete="email" placeholder="voce@exemplo.com" />
        </Campo>

        <Campo campo="senha" rotulo="Senha" erro={erros.senha}>
          <Input {...propsCampo("senha")} type="password" autoComplete="new-password" />
        </Campo>

        <Campo campo="confirmarSenha" rotulo="Confirmar senha" erro={erros.confirmarSenha}>
          <Input {...propsCampo("confirmarSenha")} type="password" autoComplete="new-password" />
        </Campo>

        {mensagemErro && (
          <p role="alert" className="text-sm text-destructive">
            {mensagemErro}
          </p>
        )}

        <Button type="submit" size="lg" disabled={cadastrando}>
          {cadastrando && <LoaderCircle className="animate-spin" />}
          {cadastrando ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}

function Campo({
  campo,
  rotulo,
  erro,
  children,
}: {
  campo: keyof ValoresCadastro
  rotulo: string
  erro?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`campo-${campo}`}>{rotulo}</Label>
      {children}
      {erro && (
        <p id={`erro-${campo}`} className="text-xs text-destructive">
          {erro}
        </p>
      )}
    </div>
  )
}
