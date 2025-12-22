export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatPriceDisplay(price: {
  kind: "fixed" | "from" | "quote"
  amount?: number
}): string {
  if (!price || !price.kind) {
    return "Precio no disponible"
  }
  if (price.kind === "quote") {
    return "Consultar precio"
  }

  if (price.kind === "from" && price.amount) {
    return `Desde ${formatPrice(price.amount)}`
  }

  if (price.kind === "fixed" && price.amount) {
    return formatPrice(price.amount)
  }

  return "Precio no disponible"
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}
