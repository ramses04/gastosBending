import { db } from './db'
import { isoDate, newId } from '../lib/ids'
import { utilityShare, peopleForBill } from '../domain/utilities'
import type { AppSettings, UtilityBill, YearRecord } from './types'

function categoryIdForKind(settings: AppSettings, kind: UtilityBill['kind']): string | null {
  if (kind === 'gas') return settings.gasCategoryId
  if (kind === 'luz') return settings.luzCategoryId
  return settings.aguaCategoryId
}

export async function upsertUtilityMovement(
  bill: UtilityBill,
  year: YearRecord,
  settings: AppSettings,
): Promise<void> {
  const categoryId = categoryIdForKind(settings, bill.kind)
  const existing = await db.movements.where('utilityBillId').equals(bill.id).first()

  if (!categoryId) {
    if (existing) await db.movements.delete(existing.id)
    return
  }

  const payload = {
    yearId: year.id,
    categoryId,
    date: isoDate(year.year, bill.month, 15),
    amount: utilityShare(bill.amount, peopleForBill(bill, settings.utilitiesSplit)),
    note: bill.note ? `Factura ${bill.kind}: ${bill.note}` : `Factura ${bill.kind}`,
    source: 'utility' as const,
    status: 'confirmed' as const,
    utilityBillId: bill.id,
  }

  if (existing) {
    await db.movements.update(existing.id, payload)
  } else {
    await db.movements.add({ id: newId(), ...payload })
  }
}

export async function deleteUtilityBill(billId: string): Promise<void> {
  const linked = await db.movements.where('utilityBillId').equals(billId).toArray()
  await db.transaction('rw', db.utilityBills, db.movements, async () => {
    await db.utilityBills.delete(billId)
    await db.movements.bulkDelete(linked.map((m) => m.id))
  })
}

export async function resyncAllUtilityBills(year: YearRecord, settings: AppSettings): Promise<void> {
  const bills = await db.utilityBills.where('yearId').equals(year.id).toArray()
  for (const bill of bills) {
    await upsertUtilityMovement(bill, year, settings)
  }
}
