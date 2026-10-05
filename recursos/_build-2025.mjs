import { writeFileSync } from 'node:fs'

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function cells(values) {
  return values.map((amount, i) =>
    amount === null || amount === undefined
      ? null
      : { month: i + 1, amount },
  ).filter(Boolean)
}

function mov({ prefix, categoryId, yearId, source = 'grid', status = 'confirmed', extra = {} }, series) {
  return cells(series).map(({ month, amount }) => ({
    id: `${prefix}-${String(month).padStart(2, '0')}`,
    yearId,
    categoryId,
    date: `2025-${String(month).padStart(2, '0')}-01`,
    amount,
    source,
    status,
    ...extra,
  }))
}

const cats2025 = [
  ['renta', 'Renta', 'fixed', 0],
  ['metro', 'Metro', 'fixed', 1],
  ['internet', 'Internet/tlf', 'fixed', 2],
  ['prime', 'Amazon Prime', 'fixed', 3],
  ['glovo', 'Uber One/Glovo', 'fixed', 4],
  ['acens', 'Acens', 'fixed', 5],
  ['gas', 'Gas', 'fixed', 6, { linkedUtility: 'gas' }],
  ['luz', 'Luz', 'fixed', 7, { linkedUtility: 'luz' }],
  ['agua', 'Agua', 'fixed', 8, { linkedUtility: 'agua' }],
  ['youtube', 'YouTube', 'fixed', 9],
  ['tarjeta', 'Tarjeta conjunta', 'fixed', 10],
  ['ahorro', 'Ahorro', 'savings', 20],
  ['mercado', 'Mercado', 'leisure', 30],
  ['comida', 'Comida', 'leisure', 31],
  ['delivery', 'Delivery', 'leisure', 32],
  ['compras', 'Compras', 'leisure', 33],
  ['misc', 'Misceláneos', 'leisure', 34],
  ['ayuda', 'Ayuda', 'leisure', 35],
  ['viajes', 'Viajes', 'leisure', 36],
  ['sputnik', 'Sputnik', 'leisure', 37],
  ['juegos', 'Juegos', 'leisure', 38],
  ['regalos', 'Regalos', 'leisure', 39],
  ['acciona', 'Acciona', 'leisure', 40],
].map(([id, name, group, sortOrder, extra]) => ({
  id: `cat-2025-${id}`,
  yearId: 'year-2025',
  name,
  group,
  color: group === 'fixed' ? '#e8a598' : group === 'savings' ? '#8fbc8f' : '#f3d77a',
  sortOrder,
  validFrom: 1,
  validTo: 12,
  archived: false,
  ...extra,
}))

const m = (id, series, extra) =>
  mov({ prefix: `mov-2025-${id}`, categoryId: `cat-2025-${id}`, yearId: 'year-2025', extra }, series)

const bills = [
  { id: 'bill-2025-gas-02', kind: 'gas', month: 2, amount: 166 },
  { id: 'bill-2025-gas-06', kind: 'gas', month: 6, amount: 54 },
  { id: 'bill-2025-gas-08', kind: 'gas', month: 8, amount: 146.24 },
  { id: 'bill-2025-gas-10', kind: 'gas', month: 10, amount: 101.91 },
  { id: 'bill-2025-gas-12', kind: 'gas', month: 12, amount: 141.32 },
  { id: 'bill-2025-luz-03', kind: 'luz', month: 3, amount: 195 },
  { id: 'bill-2025-luz-06', kind: 'luz', month: 6, amount: 148.66 },
  { id: 'bill-2025-luz-08', kind: 'luz', month: 8, amount: 137.64 },
  { id: 'bill-2025-luz-10', kind: 'luz', month: 10, amount: 167.91 },
  { id: 'bill-2025-luz-12', kind: 'luz', month: 12, amount: 89.66 },
  { id: 'bill-2025-agua-04', kind: 'agua', month: 4, amount: 82.6 },
  { id: 'bill-2025-agua-06', kind: 'agua', month: 6, amount: 73.27 },
  { id: 'bill-2025-agua-08', kind: 'agua', month: 8, amount: 73.27 },
  { id: 'bill-2025-agua-10', kind: 'agua', month: 10, amount: 23 },
  { id: 'bill-2025-agua-12', kind: 'agua', month: 12, amount: 52.54 },
].map((b) => ({ ...b, yearId: 'year-2025', split: 3 }))

const gasShare = [null, 101.4, null, 21.8, null, 37.31, null, 62, null, 33.97, null, 47.11]
const luzShare = [null, 119, null, 68, null, 31.5, null, 210, null, 25.97, null, 29.88]
const aguaShare = [null, 51, null, 33.04, null, 18.32, null, 66, null, 7.87, null, 17.51]

function utilityMovs(kind, shares) {
  return cells(shares).map(({ month, amount }) => {
    const bill = bills.find((b) => b.kind === kind && b.month === month)
    return {
      id: `mov-2025-${kind}-${String(month).padStart(2, '0')}`,
      yearId: 'year-2025',
      categoryId: `cat-2025-${kind}`,
      date: `2025-${String(month).padStart(2, '0')}-15`,
      amount,
      source: bill ? 'utility' : 'grid',
      status: 'confirmed',
      ...(bill ? { utilityBillId: bill.id, note: `Factura ${kind} ${bill.amount} € (cuota de la hoja)` } : {}),
    }
  })
}

const movements2025 = [
  ...m('renta', [454, 534, 534, 534, 388, 390, 744, 363, 363, 363, 373, 373]),
  ...m('metro', [6, 6, 6, 6, 15, 7, 7, 7, 7, 7, 7, 7]),
  ...m('internet', [50, 50, 50, 50, 50, 50, 50, 50, 30, 30, 30, 70]),
  ...m('prime', [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]),
  ...m('glovo', [5, 5, 5, 5, 5, 5, 8, 8, 8, 8, 8, 8]),
  ...m('acens', [6, 6, 6, 6, 18, 6, 6, 6, null, null, null]),
  ...utilityMovs('gas', gasShare),
  ...utilityMovs('luz', luzShare),
  ...utilityMovs('agua', aguaShare),
  ...m('youtube', [26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26]),
  ...m('tarjeta', [150, null, 150, 150, null, null, null, null, null, null, null, null]),
  ...m('ahorro', [600, -250, 800, 1710, 150, 800, -1000, -1000, 430, 2000, -300, 2000], { source: 'manual' }),
  ...m('mercado', [45, 238, 50, 75, 167, 38, 125, 100, 165, 163, 164, 100]),
  ...m('comida', [68, 130, 129, 159, 161, 122, 144, 212, 232, 234, 84, 363]),
  ...m('delivery', [60, 65, 71, 142, 120, 85, 91, 121, 73, 76, 50, null]),
  ...m('compras', [113, 40, 177, 245, 110, 224, 104, 210, 200, 160, 146, 219]),
  ...m('misc', [32, 14, 155, 3, 31, 8, 75, 64, 146, 70, 40, 95]),
  ...m('ayuda', [null, 100, 100, null, null, null, null, 1000, 100, null, null, null]),
  ...m('viajes', [null, 74, 15, null, 20, 161, 1101, 250, 255, null, 500, 576]),
  ...m('sputnik', [null, 174, null, null, 174, null, null, 188, null, null, 188, null]),
  ...m('juegos', [13, 36, 25, 10, 25, 4, 6, 17, null, 11, 69, null]),
  ...m('regalos', [7, 92, 13, 30, 83, 85, 254, 40, 230, 114, 12, null]),
  ...m('acciona', [null, null, 120, 120, 120, 120, 120, 120, 120, 120, 120, 120]),
]

const recurrences2025 = [
  { id: 'rec-2025-prime', categoryId: 'cat-2025-prime', amount: 5, fromMonth: 1, toMonth: 12 },
  { id: 'rec-2025-youtube', categoryId: 'cat-2025-youtube', amount: 26, fromMonth: 1, toMonth: 12 },
  { id: 'rec-2025-glovo-a', categoryId: 'cat-2025-glovo', amount: 5, fromMonth: 1, toMonth: 6 },
  { id: 'rec-2025-glovo-b', categoryId: 'cat-2025-glovo', amount: 8, fromMonth: 7, toMonth: 12 },
  { id: 'rec-2025-acciona', categoryId: 'cat-2025-acciona', amount: 120, fromMonth: 3, toMonth: 12 },
].map((r) => ({ ...r, yearId: 'year-2025' }))

export { cats2025, movements2025, recurrences2025, bills, months }
