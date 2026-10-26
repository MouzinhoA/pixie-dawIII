"use client"

import { useState } from "react"
import { LoaderCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PropsConfirmarExclusao {
  nomeItem: string
  aoConfirmar: () => Promise<boolean> 
}

export function ConfirmarExclusao({ nomeItem, aoConfirmar }: PropsConfirmarExclusao) {
  const [aberto, setAberto] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmar() {
    setExcluindo(true)
    const excluiu = await aoConfirmar()
    setExcluindo(false)
    if (excluiu) setAberto(false)
  }

  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !excluindo && setAberto(abrir)}>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2 /> Excluir
      </DialogTrigger>
      <DialogContent showCloseButton={!excluindo}>
        <DialogHeader>
          <DialogTitle>Excluir item?</DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{nomeItem}</strong> será removido permanentemente. Esta ação não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={excluindo} />}>Cancelar</DialogClose>
          <Button
            onClick={confirmar}
            disabled={excluindo}
            className="bg-destructive text-white hover:bg-destructive/90 dark:text-background"
          >
            {excluindo && <LoaderCircle className="animate-spin" />}
            {excluindo ? "Excluindo..." : "Sim, excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
