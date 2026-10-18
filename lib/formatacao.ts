// Funções de formatação para exibir valores no padrão brasileiro

const formatadorMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function formatarPreco(valor: number): string {
  return formatadorMoeda.format(valor)
}

export function formatarData(dataIso: string): string {
  return formatadorData.format(new Date(dataIso))
}
