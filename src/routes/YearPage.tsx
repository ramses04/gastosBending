import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Amount, Percent } from '../components/Amount'
import { ScreenHeader } from '../components/ui'
import { MONTHS_SHORT, isCategoryActiveInMonth } from '../domain/calendar'
import {
  categoryPctOfAnnualIncome,
  cellFromMovements,
  monthTotals,
  type CellValue,
} from '../domain/sheet'
import { parseAmount } from '../domain/money'
import { db } from '../db/db'
import { isoDate, newId, todayIso } from '../lib/ids'
import { useYearState } from '../state/YearContext'
import type { Category, Movement } from '../db/types'

export function YearPage() {
  const { year, categories, incomePeriods, movements } = useYearState()
  const navigate = useNavigate()
  const [editing, setEditing] = useState<{ categoryId: string; month: number } | null>(null)
  const [draft, setDraft] = useState('')

  const byCatMonth = useMemo(() => {
    const map = new Map<string, Movement[]>()
    for (const m of movements) {
      const key = `${m.categoryId}:${m.date.slice(5, 7)}`
      const list = map.get(key) ?? []
      list.push(m)
      map.set(key, list)
    }
    return map
  }, [movements])

  if (!year) return null
  const activeYear = year

  const groups = [
    { id: 'fixed' as const, label: 'Gastos fijos', tone: 'bg-fixed', sticky: 'year-sticky-fixed' },
    { id: 'savings' as const, label: 'Ahorro', tone: 'bg-savings', sticky: 'year-sticky-savings' },
    { id: 'leisure' as const, label: 'Ocio', tone: 'bg-leisure', sticky: 'year-sticky-leisure' },
  ]

  const monthly = Array.from({ length: 12 }, (_, i) =>
    monthTotals(movements, categories, incomePeriods, activeYear.year, i + 1),
  )

  function cell(categoryId: string, month: number): CellValue {
    const list = byCatMonth.get(`${categoryId}:${String(month).padStart(2, '0')}`) ?? []
    return cellFromMovements(list)
  }

  async function applyCell(category: Category, month: number, raw: string) {
    const value = parseAmount(raw)
    if (value === null) {
      setEditing(null)
      return
    }
    const list = byCatMonth.get(`${category.id}:${String(month).padStart(2, '0')}`) ?? []
    if (list.length > 1) {
      navigate(`/mes/${month}`)
      return
    }
    if (list.length === 1) {
      await db.movements.update(list[0].id, { amount: value, status: 'confirmed' })
    } else {
      await db.movements.add({
        id: newId(),
        yearId: activeYear.id,
        categoryId: category.id,
        date: isoDate(activeYear.year, month, 1),
        amount: value,
        source: 'grid',
        status: 'confirmed',
      })
    }
    await db.years.update(activeYear.id, { updatedAt: todayIso() })
    setEditing(null)
  }

  return (
    <>
      <div className="px-4">
        <ScreenHeader title={`Hoja ${activeYear.year}`} subtitle="Desliza meses · toca una celda para editar" />
      </div>
      <div className="year-grid-wrap pb-4 -mx-4">
        <table className="year-grid">
          <colgroup>
            <col className="col-concept" />
            {MONTHS_SHORT.map((m) => (
              <col key={m} className="col-month" />
            ))}
            <col className="col-pct" />
          </colgroup>
          <thead>
            <tr>
              <th className="year-head-corner year-sticky-head text-left px-2 py-2">Concepto</th>
              {MONTHS_SHORT.map((m) => (
                <th key={m} className="year-head year-sticky-head px-1 py-2">
                  {m}
                </th>
              ))}
              <th className="year-head year-sticky-head px-1 py-2">%</th>
            </tr>
          </thead>
          {groups.map((g) => {
            const rows = categories
              .filter((c) => c.group === g.id && !c.archived)
              .sort((a, b) => a.sortOrder - b.sortOrder)
            return (
              <tbody key={g.id}>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <th className={`year-sticky text-left px-2 py-1.5 font-medium ${g.sticky}`}>
                      {c.name}
                    </th>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const active = isCategoryActiveInMonth(c.validFrom, c.validTo, month)
                      const v = cell(c.id, month)
                      const isEdit = editing?.categoryId === c.id && editing.month === month
                      return (
                        <td
                          key={month}
                          className={`z-0 px-0.5 py-1 text-center border-b border-ink/5 h-9 ${
                            v.kind === 'pending' ? 'italic text-ink/55' : ''
                          }`}
                        >
                          {!active ? (
                            <span className="text-ink/20">·</span>
                          ) : isEdit ? (
                            <input
                              className="year-cell-input"
                              autoFocus
                              inputMode="decimal"
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              onBlur={() => void applyCell(c, month, draft)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              className="w-full h-full min-h-8"
                              onClick={() => {
                                if (c.linkedUtility) {
                                  navigate('/mas/suministros')
                                  return
                                }
                                const list = byCatMonth.get(`${c.id}:${String(month).padStart(2, '0')}`) ?? []
                                if (list.length > 1) {
                                  navigate(`/mes/${month}`)
                                  return
                                }
                                setDraft(v.amount === null ? '' : String(v.amount).replace('.', ','))
                                setEditing({ categoryId: c.id, month })
                              }}
                            >
                              {v.amount === null ? '' : v.amount.toLocaleString('es-ES')}
                            </button>
                          )}
                        </td>
                      )
                    })}
                    <td className="z-0 px-1 text-right">
                      <Percent ratio={categoryPctOfAnnualIncome(movements, c.id, incomePeriods)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            )
          })}
          <tbody>
            <TotalRow label="Fijos" tone="bg-fixed" sticky="year-sticky-fixed" values={monthly.map((m) => m.fixed)} pcts={monthly.map((m) => m.fixedPct)} />
            <TotalRow label="Ocio" tone="bg-leisure" sticky="year-sticky-leisure" values={monthly.map((m) => m.leisure)} pcts={monthly.map((m) => m.leisurePct)} />
            <TotalRow label="Ahorro" tone="bg-savings" sticky="year-sticky-savings" values={monthly.map((m) => m.savings)} pcts={monthly.map((m) => m.savingsPct)} />
          </tbody>
        </table>
      </div>
    </>
  )
}

function TotalRow({
  label,
  tone,
  sticky,
  values,
  pcts,
}: {
  label: string
  tone: string
  sticky: string
  values: number[]
  pcts: number[]
}) {
  return (
    <>
      <tr>
        <th className={`year-sticky text-left px-2 py-1.5 ${sticky}`}>{label}</th>
        {values.map((v, i) => (
          <td key={i} className={`z-0 px-0.5 py-1 text-center ${tone}`}>
            <Amount value={v} />
          </td>
        ))}
        <td className={`z-0 ${tone}`} />
      </tr>
      <tr>
        <th className={`year-sticky text-left px-2 py-1.5 text-ink/80 ${sticky}`}>{label} %</th>
        {pcts.map((v, i) => (
          <td key={i} className={`z-0 px-0.5 py-1 text-center ${tone}`}>
            <Percent ratio={v} />
          </td>
        ))}
        <td className={`z-0 ${tone}`} />
      </tr>
    </>
  )
}
