import { readFileSync, writeFileSync } from 'node:fs'
import { cats2026, movements2026, bills2026 } from './_build-2026.mjs'

const path = new URL('./gastos-bending-2026-10-04.json', import.meta.url)
const data = JSON.parse(readFileSync(path, 'utf8'))

data.exportedAt = '2026-10-05T16:00:00.000Z'
data.settings.activeYearId = 'year-2026'
data.settings.mortgageCategoryId = 'cat-2026-hipoteca'
data.settings.gasCategoryId = 'cat-2026-gas'
data.settings.luzCategoryId = 'cat-2026-luz'
data.settings.aguaCategoryId = 'cat-2026-agua'

data.years = data.years.map((y) =>
  y.id === 'year-2026'
    ? {
        id: 'year-2026',
        year: 2026,
        openingSavings: 8695,
        updatedAt: '2026-10-05',
        notes: 'Hoja 2026 (actualizado 5-oct). Ingreso neto 2058. Inicio ahorro 8695, total 500. Notas sueldo: 33k desde 05 / 29k hasta 04. Hipoteca 573 de sep/oct no entra en fijos (el total Excel no la incluye). Prime solo ene–abr.',
      }
    : y,
)

data.incomePeriods = [
  ...data.incomePeriods.filter((p) => p.yearId !== 'year-2026'),
  {
    id: 'inc-2026-hasta-abril',
    yearId: 'year-2026',
    fromMonth: 1,
    toMonth: 4,
    netAmount: 2058,
    notes: '29k hasta 04 (neto de la hoja: 2058)',
  },
  {
    id: 'inc-2026-desde-mayo',
    yearId: 'year-2026',
    fromMonth: 5,
    toMonth: 12,
    netAmount: 2058,
    notes: '33k desde 05 (neto de la hoja: 2058)',
  },
]

data.categories = [...data.categories.filter((c) => c.yearId !== 'year-2026'), ...cats2026]
data.recurrences = data.recurrences.filter((r) => r.yearId !== 'year-2026')
data.utilityBills = [...data.utilityBills.filter((b) => b.yearId !== 'year-2026'), ...bills2026]
data.movements = [...data.movements.filter((m) => m.yearId !== 'year-2026'), ...movements2026]

writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)

const expected = {
  fixed: [572, 602.49, 516.14, 559.19, 533.29, 540.26, 726, 665.94, 673.32, 529.32, 0, 0],
  leisure: [1150, 1133, 1443, 1179, 1576, 974, 1328, 2545, 1794, 354, 118, 0],
  savings: [25, 254, 477, 1237, -8572, 1600, -3716, 0, 1500, -1000, 0, 0],
}
const ids = (group) => new Set(cats2026.filter((c) => c.group === group).map((c) => c.id))
const byMonth = (group) => {
  const set = ids(group)
  const sums = Array(12).fill(0)
  for (const m of movements2026) {
    if (!set.has(m.categoryId)) continue
    sums[Number(m.date.slice(5, 7)) - 1] += m.amount
  }
  return sums.map((n) => Math.round(n * 100) / 100)
}
for (const group of ['fixed', 'leisure', 'savings']) {
  const got = byMonth(group)
  const exp = expected[group]
  console.log(
    group,
    got.map((n, i) => ({ mes: i + 1, got: n, excel: exp[i], diff: Math.round((n - exp[i]) * 100) / 100 })),
  )
}
console.log({ cats: cats2026.length, movs: movements2026.length, bills: bills2026.length })
