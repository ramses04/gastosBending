import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, ScreenHeader, btnPrimary, inputClass } from '../components/ui'
import { db } from '../db/db'
import { parseAmount } from '../domain/money'
import { newId } from '../lib/ids'
import { useYearState } from '../state/YearContext'

export function IncomesPage() {
  const { year, incomePeriods } = useYearState()
  const [from, setFrom] = useState('1')
  const [to, setTo] = useState('12')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  async function add() {
    if (!year) return
    const netAmount = parseAmount(amount)
    if (netAmount === null) return
    await db.incomePeriods.add({
      id: newId(),
      yearId: year.id,
      fromMonth: Number(from) || 1,
      toMonth: Number(to) || 12,
      netAmount,
      notes: notes.trim() || undefined,
    })
    setAmount('')
    setNotes('')
  }

  return (
    <>
      <ScreenHeader title="Ingresos" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <p className="text-sm text-ink/70 mb-3">
        Si el sueldo cambia a mitad de año, crea dos periodos (por ejemplo 1–4 y 5–12).
      </p>
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Desde mes">
            <input className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Hasta mes">
            <input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        <Field label="Ingreso neto mensual">
          <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Notas">
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => void add()}>
          Añadir periodo
        </button>
      </Card>
      <ul className="space-y-2">
        {incomePeriods
          .slice()
          .sort((a, b) => a.fromMonth - b.fromMonth)
          .map((p) => (
            <li key={p.id} className="rounded-2xl bg-white/80 border border-ink/5 p-3 flex justify-between gap-2">
              <div>
                <p className="font-medium">
                  Mes {p.fromMonth}–{p.toMonth}: {p.netAmount.toLocaleString('es-ES')} €
                </p>
                {p.notes ? <p className="text-sm text-ink/60">{p.notes}</p> : null}
              </div>
              <button type="button" className="text-danger text-sm underline" onClick={() => void db.incomePeriods.delete(p.id)}>
                Borrar
              </button>
            </li>
          ))}
      </ul>
    </>
  )
}
