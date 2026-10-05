import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, ScreenHeader, btnPrimary, inputClass } from '../components/ui'
import { db } from '../db/db'
import { parseAmount } from '../domain/money'
import { newId } from '../lib/ids'
import { useYearState } from '../state/YearContext'

export function RecurrencesPage() {
  const { year, categories, recurrences } = useYearState()
  const usable = categories.filter((c) => !c.archived && c.group !== 'zgz' && !c.linkedUtility)
  const firstUsableId = usable[0]?.id
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    if (!categoryId && firstUsableId) setCategoryId(firstUsableId)
  }, [categoryId, firstUsableId])
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState('1')
  const [to, setTo] = useState('12')

  async function add() {
    if (!year) return
    const value = parseAmount(amount)
    if (value === null || !categoryId) return
    await db.recurrences.add({
      id: newId(),
      yearId: year.id,
      categoryId,
      amount: value,
      fromMonth: Number(from) || 1,
      toMonth: Number(to) || 12,
    })
    setAmount('')
  }

  return (
    <>
      <ScreenHeader title="Recurrentes" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <p className="text-sm text-ink/70 mb-3">
        Se crean movimientos pendientes en cada mes. Si cambia el importe (p. ej. la renta en julio),
        cierra este rango y crea otro desde ese mes.
      </p>
      <Card className="mb-4">
        <Field label="Categoría">
          <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {usable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Importe">
          <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Desde">
            <input className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Hasta">
            <input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => void add()}>
          Crear recurrente
        </button>
      </Card>
      <ul className="space-y-2">
        {recurrences.map((r) => {
          const cat = categories.find((c) => c.id === r.categoryId)
          return (
            <li key={r.id} className="rounded-2xl bg-white/80 border border-ink/5 p-3">
              <p className="font-medium">
                {cat?.name} · {r.amount.toLocaleString('es-ES')} €
              </p>
              <p className="text-sm text-ink/60">
                Meses {r.fromMonth}–{r.toMonth}
              </p>
              <button
                type="button"
                className="text-danger text-sm underline mt-2"
                onClick={() => void db.recurrences.delete(r.id)}
              >
                Borrar regla
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
