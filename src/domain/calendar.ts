export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const

export function currentMonth(now = new Date()): number {
  return now.getMonth() + 1
}

export function currentYear(now = new Date()): number {
  return now.getFullYear()
}

export function defaultMonthForYear(year: number, now = new Date()): number {
  if (year < currentYear(now)) return 12
  if (year > currentYear(now)) return 1
  return currentMonth(now)
}

export function clampMonth(month: number): number {
  if (month < 1) return 1
  if (month > 12) return 12
  return month
}

export function isCategoryActiveInMonth(
  validFrom: number,
  validTo: number,
  month: number,
): boolean {
  return month >= validFrom && month <= validTo
}
