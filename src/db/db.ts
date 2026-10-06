import Dexie, { type Table } from 'dexie'
import type {
  AppSettings,
  Category,
  IncomePeriod,
  Movement,
  Recurrence,
  UtilityBill,
  YearRecord,
} from './types'

export class GastosDB extends Dexie {
  years!: Table<YearRecord, string>
  settings!: Table<AppSettings, string>
  incomePeriods!: Table<IncomePeriod, string>
  categories!: Table<Category, string>
  recurrences!: Table<Recurrence, string>
  movements!: Table<Movement, string>
  utilityBills!: Table<UtilityBill, string>

  constructor() {
    super('gastos-bending')
    this.version(1).stores({
      years: 'id, year',
      settings: 'id',
      incomePeriods: 'id, yearId',
      categories: 'id, yearId, group',
      recurrences: 'id, yearId, categoryId',
      movements: 'id, yearId, categoryId, date, status, recurrenceId, utilityBillId',
      utilityBills: 'id, yearId, kind, month',
    })
  }
}

export const db = new GastosDB()

export const defaultSettings = (): AppSettings => ({
  id: 'global',
  utilitiesSplit: 1,
  zgzReferenceRent: 0,
  mortgageCategoryId: null,
  gasCategoryId: null,
  luzCategoryId: null,
  aguaCategoryId: null,
  activeYearId: null,
  onboardingComplete: false,
})

export async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('global')
  if (existing) return existing
  const created = defaultSettings()
  await db.settings.put(created)
  return created
}
