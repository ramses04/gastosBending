import type { IncomePeriod } from '../db/types'

export function incomeForMonth(periods: IncomePeriod[], month: number): number {
  const match = periods.find((p) => month >= p.fromMonth && month <= p.toMonth)
  return match?.netAmount ?? 0
}

export function accumulatedIncome(
  periods: IncomePeriod[],
  upToMonth: number,
): number {
  let total = 0
  for (let m = 1; m <= upToMonth; m += 1) {
    total += incomeForMonth(periods, m)
  }
  return total
}

export function annualIncome(periods: IncomePeriod[]): number {
  return accumulatedIncome(periods, 12)
}
