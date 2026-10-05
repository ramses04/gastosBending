export type CategoryGroup = 'fixed' | 'leisure' | 'savings' | 'zgz'
export type UtilityKind = 'gas' | 'luz' | 'agua'
export type MovementSource = 'manual' | 'recurrence' | 'grid' | 'utility'
export type MovementStatus = 'confirmed' | 'pending'

export interface YearRecord {
  id: string
  year: number
  openingSavings: number
  updatedAt: string
  notes?: string
}

export interface AppSettings {
  id: 'global'
  utilitiesSplit: number
  zgzReferenceRent: number
  mortgageCategoryId: string | null
  gasCategoryId: string | null
  luzCategoryId: string | null
  aguaCategoryId: string | null
  activeYearId: string | null
  onboardingComplete: boolean
}

export interface IncomePeriod {
  id: string
  yearId: string
  fromMonth: number
  toMonth: number
  netAmount: number
  notes?: string
}

export interface Category {
  id: string
  yearId: string
  name: string
  group: CategoryGroup
  color: string
  sortOrder: number
  validFrom: number
  validTo: number
  archived: boolean
  linkedUtility?: UtilityKind
  isMortgage?: boolean
}

export interface Recurrence {
  id: string
  yearId: string
  categoryId: string
  amount: number
  fromMonth: number
  toMonth: number
}

export interface Movement {
  id: string
  yearId: string
  categoryId: string
  date: string
  amount: number
  note?: string
  source: MovementSource
  status: MovementStatus
  recurrenceId?: string
  utilityBillId?: string
}

export interface UtilityBill {
  id: string
  yearId: string
  kind: UtilityKind
  month: number
  amount: number
  split?: number
  note?: string
}

export interface BackupPayload {
  version: 1
  exportedAt: string
  settings: AppSettings
  years: YearRecord[]
  incomePeriods: IncomePeriod[]
  categories: Category[]
  recurrences: Recurrence[]
  movements: Movement[]
  utilityBills: UtilityBill[]
}
