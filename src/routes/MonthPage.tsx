import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Amount, Percent } from '../components/Amount'
import { Card, ScreenHeader, btnGhost } from '../components/ui'
import { MONTHS, clampMonth, defaultMonthForYear } from '../domain/calendar'
import { monthTotals, movementsInMonth } from '../domain/sheet'
import { db } from '../db/db'
import { useYearState } from '../state/YearContext'

export function MonthPage() {
  const { month: monthParam } = useParams()
  const navigate = useNavigate()
  const { year, categories, incomePeriods, movements } = useYearState()
  const month = clampMonth(
    Number(monthParam) || (year ? defaultMonthForYear(year.year) : 12),
  )
  const [group, setGroup] = useState<'all' | 'fixed' | 'leisure' | 'savings'>('all')
  const [catId, setCatId] = useState('all')

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const inMonth = year ? movementsInMonth(movements, year.year, month) : []
  const pending = inMonth.filter((m) => m.status === 'pending')
  const list = inMonth
    .filter((m) => {
      const cat = catMap.get(m.categoryId)
      if (!cat || cat.group === 'zgz') return false
      if (group !== 'all' && cat.group !== group) return false
      if (catId !== 'all' && m.categoryId !== catId) return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  if (!year) return null
  const totals = monthTotals(movements, categories, incomePeriods, year.year, month)
  const catsForFilter = categories
    .filter((c) => c.group !== 'zgz' && (group === 'all' || c.group === group))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  async function confirm(id: string) {
    await db.movements.update(id, { status: 'confirmed' })
  }

  async function remove(id: string) {
    if (!confirmDelete()) return
    await db.movements.delete(id)
  }

  function confirmDelete() {
    return window.confirm('¿Borrar este movimiento?')
  }

  return (
    <>
      <ScreenHeader
        title={MONTHS[month - 1]}
        subtitle={String(year.year)}
        action={
          <div className="flex gap-1">
            <button
              className={btnGhost}
              type="button"
              onClick={() => navigate(`/mes/${clampMonth(month - 1)}`)}
            >
              ‹
            </button>
            <button
              className={btnGhost}
              type="button"
              onClick={() => navigate(`/mes/${clampMonth(month + 1)}`)}
            >
              ›
            </button>
          </div>
        }
      />
      <Card className="mb-3">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-fixed/40 py-2">
            <p>Fijos</p>
            <Amount value={totals.fixed} className="block font-semibold" />
            <Percent ratio={totals.fixedPct} className="text-xs" />
          </div>
          <div className="rounded-xl bg-leisure/50 py-2">
            <p>Ocio</p>
            <Amount value={totals.leisure} className="block font-semibold" />
            <Percent ratio={totals.leisurePct} className="text-xs" />
          </div>
          <div className="rounded-xl bg-savings/50 py-2">
            <p>Ahorro</p>
            <Amount value={totals.savings} className="block font-semibold" />
            <Percent ratio={totals.savingsPct} className="text-xs" />
          </div>
        </div>
      </Card>
      {pending.length ? (
        <Card className="mb-3">
          <h2 className="font-medium mb-2">Pendientes de confirmar</h2>
          <ul className="space-y-2">
            {pending.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <span>
                  {catMap.get(m.categoryId)?.name} · <Amount value={m.amount} />
                </span>
                <button
                  type="button"
                  className="text-sm bg-ink text-paper rounded-lg px-3 py-1.5"
                  onClick={() => void confirm(m.id)}
                >
                  Confirmar
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <div className="flex gap-2 mb-3">
        <select
          className="flex-1 rounded-xl border border-ink/15 bg-white px-3 py-2 min-h-11"
          value={group}
          onChange={(e) => {
            setGroup(e.target.value as typeof group)
            setCatId('all')
          }}
        >
          <option value="all">Todos los grupos</option>
          <option value="fixed">Fijos</option>
          <option value="leisure">Ocio</option>
          <option value="savings">Ahorro</option>
        </select>
        <select
          className="flex-1 rounded-xl border border-ink/15 bg-white px-3 py-2 min-h-11"
          value={catId}
          onChange={(e) => setCatId(e.target.value)}
        >
          <option value="all">Todas</option>
          {catsForFilter.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <ul className="space-y-2">
        {list.length === 0 ? (
          <p className="text-ink/60 text-sm">No hay movimientos este mes.</p>
        ) : (
          list.map((m) => {
            const cat = catMap.get(m.categoryId)
            return (
              <li key={m.id} className="rounded-2xl bg-white/80 border border-ink/5 p-3">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{cat?.name}</p>
                    <p className="text-xs text-ink/55">
                      {m.date} · {m.status === 'pending' ? 'pendiente' : m.source}
                      {m.note ? ` · ${m.note}` : ''}
                    </p>
                  </div>
                  <Amount value={m.amount} className="font-semibold" />
                </div>
                <div className="flex gap-3 mt-2 text-sm">
                  {m.status === 'pending' ? (
                    <button type="button" className="underline" onClick={() => void confirm(m.id)}>
                      Confirmar
                    </button>
                  ) : null}
                  <button type="button" className="underline text-danger" onClick={() => void remove(m.id)}>
                    Borrar
                  </button>
                </div>
              </li>
            )
          })
        )}
      </ul>
      <p className="text-xs text-ink/50 mt-4">
        Las facturas de gas, luz y agua se cargan en <Link to="/mas/suministros" className="underline">Suministros</Link>.
      </p>
    </>
  )
}
