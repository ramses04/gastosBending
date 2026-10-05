import { describe, expect, it } from 'vitest'
import { accumulatedIncome, incomeForMonth } from './income'
import type { IncomePeriod } from '../db/types'

const periods: IncomePeriod[] = [
  { id: 'a', yearId: 'y', fromMonth: 1, toMonth: 4, netAmount: 1800 },
  { id: 'b', yearId: 'y', fromMonth: 5, toMonth: 12, netAmount: 2058 },
]

describe('income', () => {
  it('usa el periodo vigente', () => {
    expect(incomeForMonth(periods, 4)).toBe(1800)
    expect(incomeForMonth(periods, 5)).toBe(2058)
    expect(incomeForMonth(periods, 12)).toBe(2058)
  })

  it('acumula por meses', () => {
    expect(accumulatedIncome(periods, 2)).toBe(3600)
    expect(accumulatedIncome(periods, 5)).toBe(1800 * 4 + 2058)
  })
})
