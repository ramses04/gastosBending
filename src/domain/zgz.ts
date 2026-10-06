import type { AppSettings, Category, Movement } from '../db/types'
import { confirmedSum, movementsInMonth } from './sheet'
import { round2 } from './money'

export function hasZgzData(categories: Category[]): boolean {
  return categories.some((c) => c.group === 'zgz')
}

export function zgzMonthBreakdown(
  movements: Movement[],
  categories: Category[],
  settings: AppSettings,
  year: number,
  month: number,
): { zgz: number; mortgageFromSheet: number; mortgage: number; toReturn: number } {
  const inMonth = movementsInMonth(movements, year, month)
  const zgzIds = new Set(
    categories.filter((c) => c.group === 'zgz' && !c.isZgzMortgage).map((c) => c.id),
  )
  const zgz = confirmedSum(inMonth.filter((m) => zgzIds.has(m.categoryId)))
  const mortgageId =
    categories.find((c) => c.isMortgage)?.id ?? settings.mortgageCategoryId
  const mortgageFromSheet = mortgageId
    ? confirmedSum(inMonth.filter((m) => m.categoryId === mortgageId))
    : 0
  const zgzMortgageId = categories.find((c) => c.group === 'zgz' && c.isZgzMortgage)?.id
  const zgzMortgageMoves = zgzMortgageId
    ? inMonth.filter((m) => m.categoryId === zgzMortgageId && m.status === 'confirmed')
    : []
  const mortgage = zgzMortgageMoves.length
    ? confirmedSum(zgzMortgageMoves)
    : mortgageFromSheet
  return {
    zgz,
    mortgageFromSheet,
    mortgage,
    toReturn: round2(settings.zgzReferenceRent - mortgage - zgz),
  }
}
