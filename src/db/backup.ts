import { db } from './db'
import type { BackupPayload } from './types'

export async function exportBackup(): Promise<BackupPayload> {
  const [settings, years, incomePeriods, categories, recurrences, movements, utilityBills] =
    await Promise.all([
      db.settings.get('global'),
      db.years.toArray(),
      db.incomePeriods.toArray(),
      db.categories.toArray(),
      db.recurrences.toArray(),
      db.movements.toArray(),
      db.utilityBills.toArray(),
    ])

  if (!settings) {
    throw new Error('No hay ajustes que exportar')
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    years,
    incomePeriods,
    categories,
    recurrences,
    movements,
    utilityBills,
  }
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  if (payload.version !== 1) {
    throw new Error('Copia no compatible')
  }

  await db.transaction(
    'rw',
    [
      db.settings,
      db.years,
      db.incomePeriods,
      db.categories,
      db.recurrences,
      db.movements,
      db.utilityBills,
    ],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.years.clear(),
        db.incomePeriods.clear(),
        db.categories.clear(),
        db.recurrences.clear(),
        db.movements.clear(),
        db.utilityBills.clear(),
      ])
      await db.settings.put(payload.settings)
      await db.years.bulkPut(payload.years)
      await db.incomePeriods.bulkPut(payload.incomePeriods)
      await db.categories.bulkPut(payload.categories)
      await db.recurrences.bulkPut(payload.recurrences)
      await db.movements.bulkPut(payload.movements)
      await db.utilityBills.bulkPut(payload.utilityBills)
    },
  )
}

export function parseBackup(text: string): BackupPayload {
  const data = JSON.parse(text) as BackupPayload
  if (!data || data.version !== 1 || !data.settings || !Array.isArray(data.years)) {
    throw new Error('El archivo no parece una copia de Gastos Bending')
  }
  return data
}
