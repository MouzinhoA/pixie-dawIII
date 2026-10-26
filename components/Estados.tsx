import { CircleAlert, LoaderCircle, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <LoaderCircle className="size-5 animate-spin" />
      <span>{texto}</span>
    </div>
  )
}

export function MensagemErro({
  texto,
  aoTentarNovamente,
}: {
  texto: string
  aoTentarNovamente?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-10 text-center"
    >
      <CircleAlert className="size-8 text-destructive" />
      <p className="max-w-md text-sm">{texto}</p>
      {aoTentarNovamente && (
        <Button variant="outline" onClick={aoTentarNovamente}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

export function ListaVazia({ titulo, children }: { titulo: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-12 text-center">
      <PackageOpen className="size-10 text-muted-foreground" />
      <p className="font-medium">{titulo}</p>
      {children}
    </div>
  )
}
