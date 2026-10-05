import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { liveQuery } from 'dexie'
import { db, ensureSettings } from '../db/db'
import { syncRecurrences } from '../db/recurrenceSync'
import type {
  AppSettings,
  Category,
  IncomePeriod,
  Movement,
  Recurrence,
  UtilityBill,
  YearRecord,
} from '../db/types'

interface YearState {
  ready: boolean
  settings: AppSettings | undefined
  years: YearRecord[]
  year: YearRecord | undefined
  categories: Category[]
  incomePeriods: IncomePeriod[]
  recurrences: Recurrence[]
  movements: Movement[]
  utilityBills: UtilityBill[]
}

const YearContext = createContext<YearState | null>(null)

function useLive<T>(querier: () => T | Promise<T>, initial: T): T {
  const [value, setValue] = useState<T>(initial)
  useEffect(() => {
    const sub = liveQuery(querier).subscribe({
      next: (next) => setValue(next as T),
      error: (err) => console.error(err),
    })
    return () => sub.unsubscribe()
  }, [querier])
  return value
}

export function YearProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void ensureSettings()
  }, [])

  const settingsQuery = useCallback(() => db.settings.get('global'), [])
  const yearsQuery = useCallback(() => db.years.orderBy('year').reverse().toArray(), [])
  const settings = useLive(settingsQuery, undefined as AppSettings | undefined)
  const years = useLive(yearsQuery, [] as YearRecord[])
  const yearId = settings?.activeYearId ?? null

  const yearQuery = useCallback((): Promise<YearRecord | undefined> => {
    if (!yearId) return Promise.resolve(undefined)
    return db.years.get(yearId)
  }, [yearId])
  const categoriesQuery = useCallback(
    () => (yearId ? db.categories.where('yearId').equals(yearId).toArray() : Promise.resolve([])),
    [yearId],
  )
  const incomesQuery = useCallback(
    () => (yearId ? db.incomePeriods.where('yearId').equals(yearId).toArray() : Promise.resolve([])),
    [yearId],
  )
  const recurrencesQuery = useCallback(
    () => (yearId ? db.recurrences.where('yearId').equals(yearId).toArray() : Promise.resolve([])),
    [yearId],
  )
  const movementsQuery = useCallback(
    () => (yearId ? db.movements.where('yearId').equals(yearId).toArray() : Promise.resolve([])),
    [yearId],
  )
  const billsQuery = useCallback(
    () => (yearId ? db.utilityBills.where('yearId').equals(yearId).toArray() : Promise.resolve([])),
    [yearId],
  )

  const year = useLive(yearQuery, undefined as YearRecord | undefined)
  const categories = useLive(categoriesQuery, [] as Category[])
  const incomePeriods = useLive(incomesQuery, [] as IncomePeriod[])
  const recurrences = useLive(recurrencesQuery, [] as Recurrence[])
  const movements = useLive(movementsQuery, [] as Movement[])
  const utilityBills = useLive(billsQuery, [] as UtilityBill[])

  useEffect(() => {
    if (year) {
      void syncRecurrences(year, recurrences)
    }
  }, [year, recurrences])

  const value = useMemo<YearState>(
    () => ({
      ready: settings !== undefined,
      settings,
      years,
      year,
      categories,
      incomePeriods,
      recurrences,
      movements,
      utilityBills,
    }),
    [settings, years, year, categories, incomePeriods, recurrences, movements, utilityBills],
  )

  return <YearContext.Provider value={value}>{children}</YearContext.Provider>
}

export function useYearState(): YearState {
  const ctx = useContext(YearContext)
  if (!ctx) throw new Error('useYearState fuera de YearProvider')
  return ctx
}
