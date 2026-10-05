import type { AppSettings, Category, Movement } from '../db/types'
import { confirmedSum, movementsInMonth } from './sheet'
import { round2 } from './money'

export function zgzMonthBreakdown(
  movements: Movement[],
  categories: Category[],
  settings: AppSettings,
  year: number,
  month: number,
): { zgz: number; mortgage: number; toReturn: number } {
  const inMonth = movementsInMonth(movements, year, month)
  const zgzIds = new Set(categories.filter((c) => c.group === 'zgz').map((c) => c.id))
  const zgz = confirmedSum(inMonth.filter((m) => zgzIds.has(m.categoryId)))
  const mortgageId =
    categories.find((c) => c.isMortgage)?.id ?? settings.mortgageCategoryId
  const mortgage = mortgageId
    ? confirmedSum(inMonth.filter((m) => m.categoryId === mortgageId))
    : 0
  return {
    zgz,
    mortgage,
    toReturn: round2(settings.zgzReferenceRent - mortgage - zgz),
  }
}
