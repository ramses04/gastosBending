import { round2 } from './money'
import type { UtilityBill } from '../db/types'

export function utilityShare(billAmount: number, split: number): number {
  const divisor = split > 0 ? split : 1
  return round2(billAmount / divisor)
}

export function peopleForBill(
  bill: Pick<UtilityBill, 'split'>,
  fallback: number,
): number {
  return bill.split && bill.split > 0 ? bill.split : fallback > 0 ? fallback : 1
}
