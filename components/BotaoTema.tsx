"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CHAVE_TEMA } from "@/lib/tema"

export function BotaoTema() {
  function alternarTema() {
    const ficouEscuro = document.documentElement.classList.toggle("dark")
    try {
      localStorage.setItem(CHAVE_TEMA, ficouEscuro ? "escuro" : "claro")
    } catch {
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={alternarTema} aria-label="Alternar tema claro/escuro">
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </Button>
  )
}
