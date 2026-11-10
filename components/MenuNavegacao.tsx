"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LogOut, Package } from "lucide-react"
import { useAvisos } from "@/components/Avisos"
import { BotaoTema } from "@/components/BotaoTema"
import { ROTAS_PUBLICAS } from "@/components/ProtecaoRota"
import { Button, buttonVariants } from "@/components/ui/button"
import { sair } from "@/lib/autenticacao"

const LINKS = [
  { href: "/", texto: "Painel", Icone: LayoutDashboard },
  { href: "/itens", texto: "Meus itens", Icone: Package },
]

export function MenuNavegacao() {
  const caminhoAtual = usePathname()
  const router = useRouter()
  const mostrarAviso = useAvisos()
  const naTelaLogin = ROTAS_PUBLICAS.includes(caminhoAtual)

  async function sairDaConta() {
    try {
      await sair()
      router.replace("/login")
    } catch (erro) {
      mostrarAviso("erro", (erro as Error).message)
    }
  }

  function estaAtivo(href: string) {
    if (href === "/") return caminhoAtual === "/"
    return caminhoAtual.startsWith(href) && caminhoAtual !== "/itens/novo"
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-4 sm:gap-2">
        <Link href="/" className="mr-2 flex items-center gap-2 sm:mr-6" aria-label="Pixie Seller — início">
          <Image src="/logo-pixie.png" alt="Pixie" width={360} height={188} priority className="h-8 w-auto" />
          <span className="hidden text-sm font-semibold tracking-wide text-primary uppercase sm:inline">Seller</span>
        </Link>

        {!naTelaLogin && LINKS.map(({ href, texto, Icone }) => (
          <Link
            key={href}
            href={href}
            aria-current={estaAtivo(href) ? "page" : undefined}
            className={buttonVariants({
              variant: estaAtivo(href) ? "secondary" : "ghost",
              className: "aria-[current=page]:font-semibold",
            })}
          >
            <Icone />
            {texto}
          </Link>
        ))}

        <div className="ml-auto" />
        <BotaoTema />
        {!naTelaLogin && (
          <Button variant="ghost" onClick={sairDaConta}>
            <LogOut />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        )}
      </nav>
    </header>
  )
}
