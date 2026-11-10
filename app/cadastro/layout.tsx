import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Criar conta",
}

export default function LayoutCadastro({ children }: LayoutProps<"/cadastro">) {
  return children
}
