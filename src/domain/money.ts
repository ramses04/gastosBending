const moneyFmt = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFmt = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const pctFmt = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatMoney(amount: number): string {
  return moneyFmt.format(amount)
}

export function formatMoneyCompact(amount: number): string {
  return compactFmt.format(amount)
}

export function formatPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—'
  return pctFmt.format(ratio)
}

export function percentOf(part: number, whole: number): number {
  if (whole === 0) return part === 0 ? 0 : Number.POSITIVE_INFINITY
  return part / whole
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function parseAmount(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, '').replace(',', '.')
  if (!normalized || normalized === '-' || normalized === '.') return null
  const n = Number(normalized)
  if (!Number.isFinite(n)) return null
  return round2(n)
}

export function isAlertPercent(ratio: number): boolean {
  return Number.isFinite(ratio) && ratio > 1
}

export function isNegative(amount: number): boolean {
  return amount < 0
}
