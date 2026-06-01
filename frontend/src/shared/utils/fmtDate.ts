export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const s = String(dateStr).substring(0, 10)
  const [y, m, d] = s.split('-')
  if (!y || !m || !d) return '-'
  return `${d}/${m}/${y}`
}

export function fmtDateTime(isoStr: string | null | undefined): string {
  if (!isoStr) return '-'
  const date = new Date(isoStr)
  if (isNaN(date.getTime())) return '-'
  const d   = String(date.getDate()).padStart(2, '0')
  const m   = String(date.getMonth() + 1).padStart(2, '0')
  const y   = date.getFullYear()
  const h   = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${d}/${m}/${y} ${h}:${min}`
}
