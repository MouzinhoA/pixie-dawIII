import { NOMES_STATUS, type StatusAnuncio } from "@/lib/tipos"

const CORES_STATUS: Record<StatusAnuncio, string> = {
  rascunho: "bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  disponivel: "bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  pausado: "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  vendido: "bg-sky-50 text-sky-700 ring-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
}

export function EtiquetaStatus({ status }: { status: StatusAnuncio }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CORES_STATUS[status] ?? CORES_STATUS.rascunho}`}
    >
      {NOMES_STATUS[status] ?? status}
    </span>
  )
}
