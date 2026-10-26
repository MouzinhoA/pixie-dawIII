import Link from "next/link"
import { ImageOff } from "lucide-react"
import { EtiquetaStatus } from "@/components/EtiquetaStatus"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatarData, formatarPreco } from "@/lib/formatacao"
import type { ItemColecao } from "@/lib/tipos"

interface PropsListaItens {
  itens: ItemColecao[]
  nomesCategorias: Map<number, string>
}

export function MiniaturaItem({ item, tamanho = "size-12" }: { item: ItemColecao; tamanho?: string }) {
  const imagem = item.imagens?.[0]
  if (!imagem) {
    return (
      <div className={`${tamanho} flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground`}>
        <ImageOff className="size-4" />
      </div>
    )
  }

  return <img src={imagem} alt={item.titulo} className={`${tamanho} shrink-0 rounded-md bg-muted object-cover`} />
}

export function ListaItens({ itens, nomesCategorias }: PropsListaItens) {
  return (
    <>
      <div className="hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Qtd.</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="pr-4 text-right">Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.id} className="relative">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <MiniaturaItem item={item} tamanho="size-10" />
                    <div className="min-w-0">
                      <Link
                        href={`/itens/${item.id}`}
                        className="block max-w-xs truncate font-medium after:absolute after:inset-0 hover:underline"
                      >
                        {item.titulo}
                      </Link>
                      {item.marca && <span className="text-xs text-muted-foreground">{item.marca}</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{nomesCategorias.get(item.categoria_id) ?? "—"}</TableCell>
                <TableCell>
                  <EtiquetaStatus status={item.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{item.quantidade}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatarPreco(item.preco)}</TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
                  {formatarData(item.criado_em)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {itens.map((item) => (
          <li key={item.id}>
            <Link
              href={`/itens/${item.id}`}
              className="flex gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
            >
              <MiniaturaItem item={item} tamanho="size-16" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-medium">{item.titulo}</span>
                  <EtiquetaStatus status={item.status} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {nomesCategorias.get(item.categoria_id) ?? "Sem categoria"} · {item.quantidade} un.
                </span>
                <span className="font-semibold tabular-nums">{formatarPreco(item.preco)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
