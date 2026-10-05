import { readFileSync, writeFileSync } from 'node:fs'
import { cats2025, movements2025, bills } from './_build-2025.mjs'

const path = new URL('./gastos-bending-2026-10-04.json', import.meta.url)
const data = JSON.parse(readFileSync(path, 'utf8'))

data.settings.activeYearId = 'year-2025'
data.settings.mortgageCategoryId = 'cat-2026-hipoteca'
data.settings.gasCategoryId = 'cat-2025-gas'
data.settings.luzCategoryId = 'cat-2025-luz'
data.settings.aguaCategoryId = 'cat-2025-agua'

data.years = data.years.map((y) =>
  y.id === 'year-2025'
    ? {
        id: 'year-2025',
        year: 2025,
        openingSavings: 2735,
        updatedAt: '2025-12-31',
        notes: 'Datos transcritos de la hoja 2025 (actualizado 31-dic). Ingreso neto 1848. Total ahorros 8675 = 2735 + 5940.',
      }
    : y,
)

data.incomePeriods = [
  {
    id: 'inc-2025-unico',
    yearId: 'year-2025',
    fromMonth: 1,
    toMonth: 12,
    netAmount: 1848,
    notes: 'Ingreso neto de la hoja 2025',
  },
  ...data.incomePeriods.filter((p) => p.yearId !== 'year-2025'),
]

data.categories = [
  ...data.categories.filter((c) => c.yearId !== 'year-2025'),
  ...cats2025,
]

data.recurrences = data.recurrences.filter((r) => r.yearId !== 'year-2025')

data.utilityBills = [
  ...data.utilityBills.filter((b) => b.yearId !== 'year-2025'),
  ...bills,
]

data.movements = [
  ...data.movements.filter((m) => m.yearId !== 'year-2025'),
  ...movements2025,
]

writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
console.log({
  cats2025: cats2025.length,
  movs2025: movements2025.length,
  bills: bills.length,
})
