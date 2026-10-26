import type { Metadata } from "next"
import { Suspense } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { MenuNavegacao } from "@/components/MenuNavegacao"
import { ProvedorAvisos } from "@/components/Avisos"
import { SCRIPT_TEMA_INICIAL } from "@/lib/tema"
import "./globals.css"

const fonteSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const fonteMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Pixie Seller",
    template: "%s | Pixie Seller",
  },
  description: "Painel do vendedor Pixie para gerenciar itens colecionáveis e anúncios.",
}

export default function LayoutRaiz({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteSans.variable} ${fonteMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ProvedorAvisos>
          <Suspense fallback={<div className="h-14 border-b" />}>
            <MenuNavegacao />
          </Suspense>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
        </ProvedorAvisos>
      </body>
    </html>
  )
}
