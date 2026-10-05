import type { Category, CategoryGroup, UtilityKind } from './types'
import { newId } from '../lib/ids'

const COLOR = {
  fixed: '#e8a598',
  leisure: '#f3d77a',
  savings: '#8fbc8f',
  zgz: '#7ba3b8',
} as const

interface SeedCat {
  name: string
  group: CategoryGroup
  validFrom?: number
  validTo?: number
  linkedUtility?: UtilityKind
  isMortgage?: boolean
}

const TEMPLATE: SeedCat[] = [
  { name: 'Renta', group: 'fixed' },
  { name: 'Transporte', group: 'fixed' },
  { name: 'Internet/tlf', group: 'fixed' },
  { name: 'Amazon Prime', group: 'fixed' },
  { name: 'Glovo', group: 'fixed', validTo: 6 },
  { name: 'Hipoteca', group: 'fixed', validFrom: 7, isMortgage: true },
  { name: 'Acens', group: 'fixed' },
  { name: 'Gas', group: 'fixed', linkedUtility: 'gas' },
  { name: 'Luz', group: 'fixed', linkedUtility: 'luz' },
  { name: 'Agua', group: 'fixed', linkedUtility: 'agua' },
  { name: 'YouTube', group: 'fixed' },
  { name: 'Cursor', group: 'fixed' },
  { name: 'Préstamo piso', group: 'fixed' },
  { name: 'Préstamo moto', group: 'fixed' },
  { name: 'Seguros', group: 'fixed' },
  { name: 'Ahorro', group: 'savings' },
  { name: 'Mercado', group: 'leisure' },
  { name: 'Comida', group: 'leisure' },
  { name: 'Delivery', group: 'leisure' },
  { name: 'Compras', group: 'leisure' },
  { name: 'Misceláneos', group: 'leisure' },
  { name: 'Ayuda', group: 'leisure' },
  { name: 'Viajes', group: 'leisure' },
  { name: 'Sputnik', group: 'leisure' },
  { name: 'Juegos', group: 'leisure' },
  { name: 'Regalos', group: 'leisure' },
  { name: 'Acciona', group: 'leisure' },
  { name: 'Gasolina', group: 'leisure' },
  { name: 'Gas', group: 'zgz' },
  { name: 'Luz', group: 'zgz' },
  { name: 'Agua', group: 'zgz' },
  { name: 'Comunidad', group: 'zgz' },
  { name: 'Seguros', group: 'zgz' },
]

export function buildTemplateCategories(yearId: string): Category[] {
  return TEMPLATE.map((item, index) => ({
    id: newId(),
    yearId,
    name: item.name,
    group: item.group,
    color: COLOR[item.group],
    sortOrder: index,
    validFrom: item.validFrom ?? 1,
    validTo: item.validTo ?? 12,
    archived: false,
    linkedUtility: item.linkedUtility,
    isMortgage: item.isMortgage,
  }))
}

export function findSeedLinks(categories: Category[]) {
  const mortgage = categories.find((c) => c.isMortgage) ?? categories.find((c) => c.group === 'fixed' && c.name === 'Hipoteca')
  const gas = categories.find((c) => c.group === 'fixed' && c.linkedUtility === 'gas')
  const luz = categories.find((c) => c.group === 'fixed' && c.linkedUtility === 'luz')
  const agua = categories.find((c) => c.group === 'fixed' && c.linkedUtility === 'agua')
  return {
    mortgageCategoryId: mortgage?.id ?? null,
    gasCategoryId: gas?.id ?? null,
    luzCategoryId: luz?.id ?? null,
    aguaCategoryId: agua?.id ?? null,
  }
}
