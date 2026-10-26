"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package } from "lucide-react"
import { BotaoTema } from "@/components/BotaoTema"
import { buttonVariants } from "@/components/ui/button"

const LINKS = [
  { href: "/", texto: "Painel", Icone: LayoutDashboard },
  { href: "/itens", texto: "Meus itens", Icone: Package },
]

export function MenuNavegacao() {
  const caminhoAtual = usePathname()

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

        {LINKS.map(({ href, texto, Icone }) => (
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
      </nav>
    </header>
  )
}
