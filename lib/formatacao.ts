const formatadorMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function formatarPreco(valor: number): string {
  return formatadorMoeda.format(valor)
}

export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, "")
}

export function formatarCpf(texto: string): string {
  return apenasDigitos(texto)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

export function formatarData(dataIso: string): string {
  return formatadorData.format(new Date(dataIso))
}
