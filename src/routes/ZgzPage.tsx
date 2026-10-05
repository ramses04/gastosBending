import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Amount } from '../components/Amount'
import { Card, Field, ScreenHeader, btnPrimary, inputClass } from '../components/ui'
import { db } from '../db/db'
import { MONTHS } from '../domain/calendar'
import { parseAmount } from '../domain/money'
import { zgzMonthBreakdown } from '../domain/zgz'
import { isoDate, newId, todayIso } from '../lib/ids'
import { useYearState } from '../state/YearContext'

export function ZgzPage() {
  const { year, settings, categories, movements } = useYearState()
  const zgzCats = categories.filter((c) => c.group === 'zgz' && !c.archived).sort((a, b) => a.sortOrder - b.sortOrder)
  const firstZgzId = zgzCats[0]?.id
  const [categoryId, setCategoryId] = useState('')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!categoryId && firstZgzId) setCategoryId(firstZgzId)
  }, [categoryId, firstZgzId])

  if (!year || !settings) return null

  async function add() {
    if (!year) return
    const value = parseAmount(amount)
    if (value === null || !categoryId) return
    await db.movements.add({
      id: newId(),
      yearId: year.id,
      categoryId,
      date: isoDate(year.year, Number(month) || 1, 10),
      amount: value,
      source: 'manual',
      status: 'confirmed',
    })
    await db.years.update(year.id, { updatedAt: todayIso() })
    setAmount('')
  }

  return (
    <>
      <ScreenHeader title="ZGZ" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <p className="text-sm text-ink/70 mb-3">
        Gastos del segundo inmueble. No entran en fijos ni ocio. A devolver = renta de referencia − hipoteca −
        estos gastos.
      </p>
      <Card className="mb-4">
        <Field label="Categoría ZGZ">
          <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {zgzCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mes">
          <select className={inputClass} value={month} onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Importe">
          <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => void add()}>
          Añadir gasto ZGZ
        </button>
      </Card>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm min-w-[36rem]">
          <thead>
            <tr className="bg-accent/70">
              <th className="text-left p-2">Mes</th>
              {zgzCats.map((c) => (
                <th key={c.id} className="p-2">
                  {c.name}
                </th>
              ))}
              <th className="p-2">A devolver</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((_, i) => {
              const m = i + 1
              const br = zgzMonthBreakdown(movements, categories, settings, year.year, m)
              return (
                <tr key={m} className="border-b border-ink/5">
                  <td className="p-2">{MONTHS[i].slice(0, 3)}</td>
                  {zgzCats.map((c) => {
                    const sum = movements
                      .filter(
                        (mv) =>
                          mv.categoryId === c.id &&
                          mv.status === 'confirmed' &&
                          mv.date.startsWith(`${year.year}-${String(m).padStart(2, '0')}`),
                      )
                      .reduce((s, mv) => s + mv.amount, 0)
                    return (
                      <td key={c.id} className="p-2 text-center">
                        {sum ? <Amount value={sum} /> : ''}
                      </td>
                    )
                  })}
                  <td className="p-2 text-center font-medium">
                    <Amount value={br.toReturn} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
