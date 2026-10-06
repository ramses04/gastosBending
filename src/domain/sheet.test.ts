import { describe, expect, it } from 'vitest'
import { cellFromMovements, yearTotals } from './sheet'
import { zgzMonthBreakdown } from './zgz'
import { utilityShare } from './utilities'
import { percentOf } from './money'
import type { AppSettings, Category, Movement } from '../db/types'

describe('cellFromMovements', () => {
  it('vacío si no hay datos', () => {
    expect(cellFromMovements([]).kind).toBe('empty')
    expect(cellFromMovements([]).amount).toBeNull()
  })

  it('cero explícito', () => {
    const cell = cellFromMovements([
      {
        id: '1',
        yearId: 'y',
        categoryId: 'c',
        date: '2026-01-01',
        amount: 0,
        source: 'grid',
        status: 'confirmed',
      },
    ])
    expect(cell.kind).toBe('confirmed')
    expect(cell.amount).toBe(0)
  })

  it('muestra pendientes si no hay confirmados', () => {
    const cell = cellFromMovements([
      {
        id: '1',
        yearId: 'y',
        categoryId: 'c',
        date: '2026-07-01',
        amount: 400,
        source: 'recurrence',
        status: 'pending',
      },
    ])
    expect(cell.kind).toBe('pending')
    expect(cell.amount).toBe(400)
  })
})

describe('totales y zgz', () => {
  const cats: Category[] = [
    {
      id: 'renta',
      yearId: 'y',
      name: 'Renta',
      group: 'fixed',
      color: '#e8a598',
      sortOrder: 0,
      validFrom: 1,
      validTo: 12,
      archived: false,
    },
    {
      id: 'ocio',
      yearId: 'y',
      name: 'Compras',
      group: 'leisure',
      color: '#f3d77a',
      sortOrder: 0,
      validFrom: 1,
      validTo: 12,
      archived: false,
    },
    {
      id: 'aho',
      yearId: 'y',
      name: 'Ahorro',
      group: 'savings',
      color: '#8fbc8f',
      sortOrder: 0,
      validFrom: 1,
      validTo: 12,
      archived: false,
    },
    {
      id: 'hip',
      yearId: 'y',
      name: 'Hipoteca',
      group: 'fixed',
      color: '#e8a598',
      sortOrder: 1,
      validFrom: 7,
      validTo: 12,
      archived: false,
    },
    {
      id: 'zgas',
      yearId: 'y',
      name: 'Gas',
      group: 'zgz',
      color: '#a8c5d4',
      sortOrder: 0,
      validFrom: 1,
      validTo: 12,
      archived: false,
    },
  ]

  const movements: Movement[] = [
    { id: '1', yearId: 'y', categoryId: 'renta', date: '2026-01-01', amount: 400, source: 'manual', status: 'confirmed' },
    { id: '2', yearId: 'y', categoryId: 'ocio', date: '2026-01-03', amount: 50, source: 'manual', status: 'confirmed' },
    { id: '3', yearId: 'y', categoryId: 'aho', date: '2026-01-31', amount: 25, source: 'manual', status: 'confirmed' },
    { id: '4', yearId: 'y', categoryId: 'hip', date: '2026-07-01', amount: 400, source: 'manual', status: 'confirmed' },
    { id: '5', yearId: 'y', categoryId: 'zgas', date: '2026-07-10', amount: 80, source: 'manual', status: 'confirmed' },
  ]

  it('calcula saldo de ahorro', () => {
    const t = yearTotals(movements, cats, [{ id: 'i', yearId: 'y', fromMonth: 1, toMonth: 12, netAmount: 2000 }], 1000)
    expect(t.currentSavings).toBe(1025)
    expect(t.fixed).toBe(800)
  })

  it('A devolver = renta ZGZ − hipoteca − gastos ZGZ', () => {
    const settings: AppSettings = {
      id: 'global',
      utilitiesSplit: 3,
      zgzReferenceRent: 1000,
      mortgageCategoryId: 'hip',
      gasCategoryId: null,
      luzCategoryId: null,
      aguaCategoryId: null,
      activeYearId: 'y',
      onboardingComplete: true,
    }
    const r = zgzMonthBreakdown(movements, cats, settings, 2026, 7)
    expect(r.mortgageFromSheet).toBe(400)
    expect(r.toReturn).toBeCloseTo(1000 - 400 - 80, 2)

    const withCustom: Category = {
      id: 'zhip',
      yearId: 'y',
      name: 'Hipoteca',
      group: 'zgz',
      color: '#7ba3b8',
      sortOrder: 1,
      validFrom: 1,
      validTo: 12,
      archived: false,
      isZgzMortgage: true,
    }
    const customMoves: Movement[] = [
      ...movements,
      { id: '6', yearId: 'y', categoryId: 'zhip', date: '2026-07-10', amount: 90, source: 'manual', status: 'confirmed' },
    ]
    const custom = zgzMonthBreakdown(customMoves, [...cats, withCustom], settings, 2026, 7)
    expect(custom.mortgage).toBe(90)
    expect(custom.zgz).toBe(80)
    expect(custom.toReturn).toBeCloseTo(1000 - 90 - 80, 2)
  })

  it('porcentaje alerta y cuota de factura', () => {
    expect(percentOf(2500, 2000)).toBeGreaterThan(1)
    expect(utilityShare(107.34, 3)).toBeCloseTo(35.78, 2)
  })
})
