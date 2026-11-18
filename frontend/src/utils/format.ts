export const fmtPrice = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

export const timeAgo = (s: string) => {
  const d = Date.now() - new Date(s).getTime()
  if (d < 60e3) return "à l'instant"
  if (d < 3600e3) return `il y a ${Math.floor(d/60e3)} min`
  if (d < 86400e3) return `il y a ${Math.floor(d/3600e3)} h`
  if (d < 604800e3) return `il y a ${Math.floor(d/86400e3)} j`
  return fmtDate(s)
}

export const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

export const statusLabel: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', shipped: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée',
}
