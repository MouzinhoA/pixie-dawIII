"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { CircleCheck, CircleAlert, X } from "lucide-react"

type TipoAviso = "sucesso" | "erro"

interface Aviso {
  id: number
  tipo: TipoAviso
  texto: string
}

const ContextoAvisos = createContext<(tipo: TipoAviso, texto: string) => void>(() => {})

const DURACAO_AVISO_MS = 5000

export function ProvedorAvisos({ children }: { children: React.ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])

  const fecharAviso = useCallback((id: number) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id))
  }, [])

  const mostrarAviso = useCallback(
    (tipo: TipoAviso, texto: string) => {
      const id = Date.now() + Math.random()
      setAvisos((atuais) => [...atuais, { id, tipo, texto }])
      setTimeout(() => fecharAviso(id), DURACAO_AVISO_MS)
    },
    [fecharAviso]
  )

  return (
    <ContextoAvisos.Provider value={mostrarAviso}>
      {children}
      <div className="fixed right-4 bottom-4 left-4 z-50 flex flex-col items-end gap-2 sm:left-auto">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role={aviso.tipo === "erro" ? "alert" : "status"}
            className={
              "flex w-full max-w-sm items-start gap-2 rounded-lg border p-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 " +
              (aviso.tipo === "sucesso"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
                : "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100")
            }
          >
            {aviso.tipo === "sucesso" ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
            )}
            <p className="flex-1">{aviso.texto}</p>
            <button
              type="button"
              onClick={() => fecharAviso(aviso.id)}
              aria-label="Fechar mensagem"
              className="opacity-60 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  )
}

export function useAvisos() {
  return useContext(ContextoAvisos)
}
