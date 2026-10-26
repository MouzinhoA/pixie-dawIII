"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LoaderCircle } from "lucide-react"
import { CampoSelecao } from "@/components/CampoSelecao"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buscarCategorias } from "@/lib/servicoItens"
import {
  LISTA_CONDICOES,
  LISTA_STATUS,
  NOMES_CONDICAO,
  NOMES_STATUS,
  type Categoria,
  type DadosItem,
  type ItemColecao,
} from "@/lib/tipos"
import {
  itemParaFormulario,
  validarItem,
  type ErrosFormulario,
  type ValoresFormulario,
} from "@/lib/validacao"

interface PropsFormularioItem {
  itemInicial?: ItemColecao 
  textoBotao: string
  enderecoCancelar: string
  aoSalvar: (dados: DadosItem) => Promise<void>
}

export function FormularioItem({ itemInicial, textoBotao, enderecoCancelar, aoSalvar }: PropsFormularioItem) {
  const [valores, setValores] = useState<ValoresFormulario>(() => itemParaFormulario(itemInicial))
  const [erros, setErros] = useState<ErrosFormulario>({})
  const [categorias, setCategorias] = useState<Categoria[] | null>(null)
  const [erroCategorias, setErroCategorias] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarCategorias()
      .then(setCategorias)
      .catch((erro: Error) => setErroCategorias(erro.message))
  }, [])

  function alterarCampo(campo: keyof ValoresFormulario, valor: string) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  async function enviarFormulario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const { erros: novosErros, dados } = validarItem(valores)
    setErros(novosErros)
    if (!dados) {
      const primeiroCampo = Object.keys(novosErros)[0]
      document.getElementById(`campo-${primeiroCampo}`)?.focus()
      return
    }

    setSalvando(true)
    try {
      await aoSalvar(dados)
    } finally {
      setSalvando(false)
    }
  }

  function propsCampo(campo: keyof ValoresFormulario) {
    return {
      id: `campo-${campo}`,
      name: campo,
      value: valores[campo],
      "aria-invalid": erros[campo] ? true : undefined,
      "aria-describedby": erros[campo] ? `erro-${campo}` : undefined,
      disabled: salvando,
    }
  }

  const imagemPreview = valores.imagem.trim()

  return (
    <form onSubmit={enviarFormulario} noValidate className="grid gap-6">
      <section className="grid gap-4 rounded-xl border p-4 sm:p-6">
        <h2 className="font-medium">Informações do item</h2>

        <Campo campo="titulo" rotulo="Nome do item" obrigatorio erro={erros.titulo}>
          <Input
            {...propsCampo("titulo")}
            maxLength={100}
            placeholder="Ex.: Charizard 1ª edição Base Set"
            onChange={(evento) => alterarCampo("titulo", evento.target.value)}
          />
        </Campo>

        <Campo
          campo="descricao"
          rotulo="Descrição"
          obrigatorio
          erro={erros.descricao}
          dica={`${valores.descricao.trim().length}/1000 caracteres`}
        >
          <textarea
            {...propsCampo("descricao")}
            rows={4}
            maxLength={1000}
            placeholder="Detalhes, edição, defeitos, o que acompanha..."
            onChange={(evento) => alterarCampo("descricao", evento.target.value)}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            campo="categoria_id"
            rotulo="Categoria"
            obrigatorio
            erro={erros.categoria_id ?? erroCategorias ?? undefined}
          >
            <CampoSelecao
              {...propsCampo("categoria_id")}
              onChange={(evento) => alterarCampo("categoria_id", evento.target.value)}
            >
              <option value="">
                {categorias === null
                  ? "Carregando categorias..."
                  : categorias.length === 0
                    ? "Nenhuma categoria cadastrada"
                    : "Selecione..."}
              </option>
              {categorias?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </CampoSelecao>
          </Campo>

          <Campo campo="marca" rotulo="Marca ou fabricante" erro={erros.marca}>
            <Input
              {...propsCampo("marca")}
              maxLength={60}
              placeholder="Ex.: Hasbro, Panini, Wizards"
              onChange={(evento) => alterarCampo("marca", evento.target.value)}
            />
          </Campo>
        </div>

        <Campo campo="condicao" rotulo="Estado de conservação" obrigatorio erro={erros.condicao}>
          <CampoSelecao
            {...propsCampo("condicao")}
            onChange={(evento) => alterarCampo("condicao", evento.target.value)}
          >
            <option value="">Selecione...</option>
            {LISTA_CONDICOES.map((condicao) => (
              <option key={condicao} value={condicao}>
                {NOMES_CONDICAO[condicao]}
              </option>
            ))}
          </CampoSelecao>
        </Campo>
      </section>

      <section className="grid gap-4 rounded-xl border p-4 sm:p-6">
        <h2 className="font-medium">Anúncio</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo campo="preco" rotulo="Preço (R$)" obrigatorio erro={erros.preco}>
            <Input
              {...propsCampo("preco")}
              inputMode="decimal"
              placeholder="0,00"
              onChange={(evento) => alterarCampo("preco", evento.target.value)}
            />
          </Campo>

          <Campo campo="quantidade" rotulo="Quantidade" obrigatorio erro={erros.quantidade}>
            <Input
              {...propsCampo("quantidade")}
              type="number"
              min={0}
              step={1}
              onChange={(evento) => alterarCampo("quantidade", evento.target.value)}
            />
          </Campo>

          <Campo campo="status" rotulo="Status do anúncio" obrigatorio erro={erros.status}>
            <CampoSelecao
              {...propsCampo("status")}
              onChange={(evento) => alterarCampo("status", evento.target.value)}
            >
              {LISTA_STATUS.map((status) => (
                <option key={status} value={status}>
                  {NOMES_STATUS[status]}
                </option>
              ))}
            </CampoSelecao>
          </Campo>
        </div>

        <Campo campo="imagem" rotulo="URL da imagem" erro={erros.imagem} dica="Opcional. Link direto para uma foto do item.">
          <Input
            {...propsCampo("imagem")}
            type="url"
            placeholder="https://..."
            onChange={(evento) => alterarCampo("imagem", evento.target.value)}
          />
        </Campo>

        {imagemPreview && !erros.imagem && (
          <img
            src={imagemPreview}
            alt="Pré-visualização da imagem do item"
            className="h-40 w-40 rounded-lg border bg-muted object-cover"
          />
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={enderecoCancelar} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Cancelar
        </Link>
        <Button type="submit" size="lg" disabled={salvando}>
          {salvando && <LoaderCircle className="animate-spin" />}
          {salvando ? "Salvando..." : textoBotao}
        </Button>
      </div>
    </form>
  )
}

function Campo({
  campo,
  rotulo,
  obrigatorio = false,
  erro,
  dica,
  children,
}: {
  campo: keyof ValoresFormulario
  rotulo: string
  obrigatorio?: boolean
  erro?: string
  dica?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`campo-${campo}`}>
        {rotulo}
        {obrigatorio && <span className="text-destructive" aria-hidden>*</span>}
      </Label>
      {children}
      {erro ? (
        <p id={`erro-${campo}`} className="text-xs text-destructive">
          {erro}
        </p>
      ) : (
        dica && <p className="text-xs text-muted-foreground">{dica}</p>
      )}
    </div>
  )
}
