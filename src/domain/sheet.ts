import type { Category, CategoryGroup, Movement } from '../db/types'
import { isCategoryActiveInMonth } from './calendar'
import { incomeForMonth, accumulatedIncome } from './income'
import { percentOf, round2 } from './money'
import type { IncomePeriod } from '../db/types'
import { monthFromIso } from '../lib/ids'

export type CellKind = 'empty' | 'confirmed' | 'pending' | 'mixed'

export interface CellValue {
  kind: CellKind
  amount: number | null
  movementCount: number
  confirmedCount: number
}

export function movementsInMonth(
  movements: Movement[],
  year: number,
  month: number,
): Movement[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return movements.filter((m) => m.date.startsWith(prefix))
}

export function cellFromMovements(movements: Movement[]): CellValue {
  const confirmed = movements.filter((m) => m.status === 'confirmed')
  const pending = movements.filter((m) => m.status === 'pending')
  if (confirmed.length && pending.length) {
    return {
      kind: 'mixed',
      amount: round2(confirmed.reduce((s, m) => s + m.amount, 0)),
      movementCount: movements.length,
      confirmedCount: confirmed.length,
    }
  }
  if (confirmed.length) {
    return {
      kind: 'confirmed',
      amount: round2(confirmed.reduce((s, m) => s + m.amount, 0)),
      movementCount: movements.length,
      confirmedCount: confirmed.length,
    }
  }
  if (pending.length) {
    return {
      kind: 'pending',
      amount: round2(pending.reduce((s, m) => s + m.amount, 0)),
      movementCount: movements.length,
      confirmedCount: 0,
    }
  }
  return { kind: 'empty', amount: null, movementCount: 0, confirmedCount: 0 }
}

export function confirmedSum(movements: Movement[]): number {
  return round2(
    movements
      .filter((m) => m.status === 'confirmed')
      .reduce((s, m) => s + m.amount, 0),
  )
}

export function groupSum(
  movements: Movement[],
  categories: Category[],
  group: CategoryGroup,
): number {
  const ids = new Set(categories.filter((c) => c.group === group).map((c) => c.id))
  return confirmedSum(movements.filter((m) => ids.has(m.categoryId)))
}

export function categoryYearTotal(
  movements: Movement[],
  categoryId: string,
): number {
  return confirmedSum(movements.filter((m) => m.categoryId === categoryId))
}

export interface MonthTotals {
  month: number
  income: number
  fixed: number
  leisure: number
  savings: number
  fixedPct: number
  leisurePct: number
  savingsPct: number
}

export function monthTotals(
  movements: Movement[],
  categories: Category[],
  periods: IncomePeriod[],
  year: number,
  month: number,
): MonthTotals {
  const inMonth = movementsInMonth(movements, year, month)
  const income = incomeForMonth(periods, month)
  const fixed = groupSum(inMonth, categories, 'fixed')
  const leisure = groupSum(inMonth, categories, 'leisure')
  const savings = groupSum(inMonth, categories, 'savings')
  return {
    month,
    income,
    fixed,
    leisure,
    savings,
    fixedPct: percentOf(fixed, income),
    leisurePct: percentOf(leisure, income),
    savingsPct: percentOf(savings, income),
  }
}

export interface YearTotals {
  income: number
  fixed: number
  leisure: number
  savings: number
  fixedPct: number
  leisurePct: number
  savingsPct: number
  openingSavings: number
  currentSavings: number
}

export function yearTotals(
  movements: Movement[],
  categories: Category[],
  periods: IncomePeriod[],
  openingSavings: number,
): YearTotals {
  const income = accumulatedIncome(periods, 12)
  const fixed = groupSum(movements, categories, 'fixed')
  const leisure = groupSum(movements, categories, 'leisure')
  const savings = groupSum(movements, categories, 'savings')
  return {
    income,
    fixed,
    leisure,
    savings,
    fixedPct: percentOf(fixed, income),
    leisurePct: percentOf(leisure, income),
    savingsPct: percentOf(savings, income),
    openingSavings,
    currentSavings: round2(openingSavings + savings),
  }
}

export function categoryPctOfAnnualIncome(
  movements: Movement[],
  categoryId: string,
  periods: IncomePeriod[],
): number {
  return percentOf(categoryYearTotal(movements, categoryId), accumulatedIncome(periods, 12))
}

export function visibleCategoriesForMonth(
  categories: Category[],
  month: number,
  includeArchived = false,
): Category[] {
  return categories
    .filter((c) => (includeArchived || !c.archived) && isCategoryActiveInMonth(c.validFrom, c.validTo, month))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'))
}

export function spendExcludingSavings(
  movements: Movement[],
  categories: Category[],
): number {
  const skip = new Set(
    categories.filter((c) => c.group === 'savings' || c.group === 'zgz').map((c) => c.id),
  )
  return confirmedSum(movements.filter((m) => !skip.has(m.categoryId)))
}

export function monthOfMovement(m: Movement): number {
  return monthFromIso(m.date)
}
