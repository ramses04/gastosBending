function cells(values) {
  return values
    .map((amount, i) => (amount === null || amount === undefined ? null : { month: i + 1, amount }))
    .filter(Boolean)
}

function seriesMov(year, id, values, extra = {}) {
  return cells(values).map(({ month, amount }) => ({
    id: `mov-${year}-${id}-${String(month).padStart(2, '0')}`,
    yearId: `year-${year}`,
    categoryId: `cat-${year}-${id}`,
    date: `${year}-${String(month).padStart(2, '0')}-${extra.day ?? '01'}`,
    amount,
    source: extra.source ?? 'grid',
    status: 'confirmed',
    ...(extra.note ? { note: extra.note } : {}),
  }))
}

const catDefs2026 = [
  ['renta', 'Renta', 'fixed', 0],
  ['transporte', 'Transporte', 'fixed', 1],
  ['internet', 'Internet/tlf', 'fixed', 2],
  ['prime', 'Amazon Prime', 'fixed', 3],
  ['glovo', 'Glovo', 'fixed', 4, { validTo: 6 }],
  ['hipoteca', 'Hipoteca', 'fixed', 5, { validFrom: 7, isMortgage: true }],
  ['acens', 'Acens', 'fixed', 6],
  ['gas', 'Gas', 'fixed', 7, { linkedUtility: 'gas' }],
  ['luz', 'Luz', 'fixed', 8, { linkedUtility: 'luz' }],
  ['agua', 'Agua', 'fixed', 9, { linkedUtility: 'agua' }],
  ['youtube', 'YouTube', 'fixed', 10],
  ['cursor', 'Cursor', 'fixed', 11],
  ['prestpiso', 'Préstamo piso', 'fixed', 12],
  ['prestmoto', 'Préstamo moto', 'fixed', 13],
  ['seguros', 'Seguros', 'fixed', 14],
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
  ['gasolina', 'Gasolina', 'leisure', 41],
  ['zgz-gas', 'Gas', 'zgz', 50],
  ['zgz-luz', 'Luz', 'zgz', 51],
  ['zgz-agua', 'Agua', 'zgz', 52],
  ['zgz-comunidad', 'Comunidad', 'zgz', 53],
  ['zgz-seguros', 'Seguros', 'zgz', 54],
]

const cats2026 = catDefs2026.map(([id, name, group, sortOrder, extra]) => ({
  id: `cat-2026-${id}`,
  yearId: 'year-2026',
  name,
  group,
  color: group === 'fixed' ? '#e8a598' : group === 'savings' ? '#8fbc8f' : group === 'zgz' ? '#7ba3b8' : '#f3d77a',
  sortOrder,
  validFrom: extra?.validFrom ?? 1,
  validTo: extra?.validTo ?? 12,
  archived: false,
  ...(extra?.linkedUtility ? { linkedUtility: extra.linkedUtility } : {}),
  ...(extra?.isMortgage ? { isMortgage: true } : {}),
}))

const bills2026 = [
  { id: 'bill-2026-gas-02', kind: 'gas', month: 2, amount: 107.34 },
  { id: 'bill-2026-gas-03', kind: 'gas', month: 3, amount: 93.83 },
  { id: 'bill-2026-gas-04', kind: 'gas', month: 4, amount: 29.76 },
  { id: 'bill-2026-gas-05', kind: 'gas', month: 5, amount: 54.92 },
  { id: 'bill-2026-gas-06', kind: 'gas', month: 6, amount: 86.83 },
  { id: 'bill-2026-gas-07', kind: 'gas', month: 7, amount: 50.81 },
  { id: 'bill-2026-luz-02', kind: 'luz', month: 2, amount: 120.15 },
  { id: 'bill-2026-luz-03', kind: 'luz', month: 3, amount: 57.43 },
  { id: 'bill-2026-luz-04', kind: 'luz', month: 4, amount: 39.84 },
  { id: 'bill-2026-luz-05', kind: 'luz', month: 5, amount: 46.11 },
  { id: 'bill-2026-luz-06', kind: 'luz', month: 6, amount: 43.74 },
  { id: 'bill-2026-luz-07', kind: 'luz', month: 7, amount: 57 },
  { id: 'bill-2026-luz-08', kind: 'luz', month: 8, amount: 53 },
  { id: 'bill-2026-luz-09', kind: 'luz', month: 9, amount: 51.97 },
  { id: 'bill-2026-luz-10', kind: 'luz', month: 10, amount: 55.15 },
  { id: 'bill-2026-agua-02', kind: 'agua', month: 2, amount: 46.98 },
  { id: 'bill-2026-agua-04', kind: 'agua', month: 4, amount: 52.88 },
  { id: 'bill-2026-agua-06', kind: 'agua', month: 6, amount: 46.98 },
  { id: 'bill-2026-agua-07', kind: 'agua', month: 7, amount: 46.98 },
].map((b) => ({ ...b, yearId: 'year-2026', split: 3 }))

function utilityMovs(kind, shares) {
  return cells(shares).map(({ month, amount }) => {
    const bill = bills2026.find((b) => b.kind === kind && b.month === month)
    const shareMatches = bill && Math.abs(amount - Math.round((bill.amount / 3) * 100) / 100) < 0.02
    return {
      id: `mov-2026-${kind}-${String(month).padStart(2, '0')}`,
      yearId: 'year-2026',
      categoryId: `cat-2026-${kind}`,
      date: `2026-${String(month).padStart(2, '0')}-15`,
      amount,
      source: shareMatches ? 'utility' : 'grid',
      status: 'confirmed',
      ...(shareMatches
        ? { utilityBillId: bill.id, note: `Factura ${kind} ${bill.amount} € ÷ 3` }
        : amount === 0
          ? { note: 'Cero explícito de la hoja' }
          : {}),
    }
  })
}

const m = (id, values, extra) => seriesMov(2026, id, values, extra)

const movements2026 = [
  ...m('renta', [373, 373, 373, 373, 373, 373, 513, 373, 373, 373, null, null]),
  ...m('transporte', [30, 7, 7, 7, 7, 7, 5, 16, null, null, null, null]),
  ...m('internet', [106, 64, 50, 50, 50, 50, 50, 50, 9, null, null, null]),
  ...m('prime', [5, 5, 5, 5, null, null, null, null, null, null, null, null]),
  ...m('glovo', [8, 8, 8, 8, 8, 8, null, null, null, null, null, null]),
  ...m('hipoteca', [null, null, null, null, null, null, 85, 111, null, null, null, null]),
  ...m('acens', [6, 6, 6, 6, 22, 6, 6, 6, 6, null, null, null]),
  ...utilityMovs('gas', [0, 35.78, 0, 31.28, 9.92, 18.31, 0, 28.61, 0, 16.94, 0, 0]),
  ...utilityMovs('luz', [0, 40.05, 19.14, 13.28, 15.37, 14.58, 19, 17.67, 17.32, 18.38, 0, 0]),
  ...utilityMovs('agua', [0, 15.66, 0, 17.63, 0, 15.37, 0, 15.66, 0, 0, 0, 0]),
  ...m('youtube', [26, 26, 26, 26, 26, 26, 26, 26, 30, null, null, null]),
  ...m('cursor', [18, 22, 22, 22, 22, 22, 22, 22, 22, 22, null, null]),
  ...m('prestpiso', [null, null, null, null, null, null, null, null, 99, 99, null, null]),
  ...m('prestmoto', [null, null, null, null, null, null, null, null, 117, null, null, null]),
  ...m('ahorro', [25, 254, 477, 1237, -8572, 1600, -3716, null, 1500, -1000, null, null], { source: 'manual' }),
  ...m('mercado', [167, 169, 280, 139, 319, 237, 237, 216, 287, 43, null, null]),
  ...m('comida', [146, 185, 273, 115, 278, 263, 236, 231, 96, 78, null, null]),
  ...m('delivery', [20, null, 23, 14, 23, 22, 11, 18, 45, null, null, null]),
  ...m('compras', [95, 36, 269, 515, 212, 134, 55, 1752, 887, 116, 95, null]),
  ...m('misc', [77, null, 76, 140, 49, 95, 116, 52, 7, null, null, null]),
  ...m('viajes', [610, 413, 460, 130, 460, 82, 50, 200, 444, 69, 23, null]),
  ...m('sputnik', [null, 188, null, null, 188, null, 588, null, null, null, null, null]),
  ...m('juegos', [9, 16, 30, null, null, 1, 23, 13, null, 48, null, null]),
  ...m('regalos', [26, null, 32, null, 47, 30, 12, 8, null, null, null, null]),
  ...m('acciona', [null, 126, null, 126, null, 110, null, 55, null, null, null, null]),
  ...m('gasolina', [null, null, null, null, null, null, null, null, 28, null, null, null]),
]

export { cats2026, movements2026, bills2026 }
