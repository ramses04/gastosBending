import { db } from './db'
import { isoDate, newId } from '../lib/ids'
import type { Recurrence, YearRecord } from './types'

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export async function syncRecurrences(year: YearRecord, recurrences: Recurrence[]): Promise<void> {
  const existing = await db.movements.where('yearId').equals(year.id).toArray()
  const byRecMonth = new Map<string, string>()
  for (const m of existing) {
    if (m.recurrenceId) {
      byRecMonth.set(`${m.recurrenceId}:${m.date.slice(0, 7)}`, m.id)
    }
  }

  const toAdd = []
  for (const rec of recurrences) {
    for (let month = rec.fromMonth; month <= rec.toMonth; month += 1) {
      const key = `${rec.id}:${monthKey(year.year, month)}`
      if (byRecMonth.has(key)) continue
      toAdd.push({
        id: newId(),
        yearId: year.id,
        categoryId: rec.categoryId,
        date: isoDate(year.year, month, 1),
        amount: rec.amount,
        source: 'recurrence' as const,
        status: 'pending' as const,
        recurrenceId: rec.id,
      })
    }
  }

  if (toAdd.length) {
    await db.movements.bulkAdd(toAdd)
  }
}
