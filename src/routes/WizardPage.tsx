import type { FormEvent } from 'react'
import { useState } from 'react'
import { completeOnboarding } from '../db/actions'
import { currentYear } from '../domain/calendar'
import { parseAmount } from '../domain/money'
import { btnPrimary, Field, inputClass } from '../components/ui'

export function WizardPage() {
  const [year, setYear] = useState(String(currentYear()))
  const [income, setIncome] = useState('2058')
  const [savings, setSavings] = useState('0')
  const [split, setSplit] = useState('3')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const netIncome = parseAmount(income)
    const openingSavings = parseAmount(savings)
    const utilitiesSplit = Number(split.replace(',', '.'))
    const yearNum = Number(year)
    if (!yearNum || netIncome === null || openingSavings === null || !utilitiesSplit) {
      setError('Revisa año, ingreso, ahorro y divisor.')
      return
    }
    setBusy(true)
    try {
      await completeOnboarding({
        year: yearNum,
        netIncome,
        openingSavings,
        utilitiesSplit,
        incomeNote: note.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el año')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh mx-auto max-w-lg px-4 py-8">
      <p className="text-sm uppercase tracking-wide text-ink/50">Gastos Bending</p>
      <h1 className="text-2xl font-semibold mt-1 mb-2">Empieza tu hoja anual</h1>
      <p className="text-ink/70 mb-6">
        Todo se guarda en este navegador. No hace falta cuenta ni servidor.
      </p>
      <form onSubmit={(e) => void submit(e)}>
        <Field label="Año">
          <input className={inputClass} inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
        </Field>
        <Field label="Ingreso neto mensual (€)">
          <input className={inputClass} inputMode="decimal" value={income} onChange={(e) => setIncome(e.target.value)} />
        </Field>
        <Field label="Notas de salario (opcional)">
          <input
            className={inputClass}
            placeholder="p. ej. 33k desde 05 / 29k hasta 04"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <Field label="Ahorro a 1 de enero (€)">
          <input className={inputClass} inputMode="decimal" value={savings} onChange={(e) => setSavings(e.target.value)} />
        </Field>
        <Field label="Personas por defecto al dividir una factura">
          <input className={inputClass} inputMode="decimal" value={split} onChange={(e) => setSplit(e.target.value)} />
        </Field>
        {error ? <p className="text-danger text-sm mb-3">{error}</p> : null}
        <button className={`${btnPrimary} w-full`} disabled={busy} type="submit">
          Crear mi hoja
        </button>
      </form>
    </div>
  )
}
