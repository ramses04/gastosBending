import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Field, ScreenHeader, btnPrimary, inputClass } from '../components/ui'
import { copyYearTemplate } from '../db/actions'
import { parseAmount } from '../domain/money'
import { useYearState } from '../state/YearContext'

export function CopyYearPage() {
  const { year, years } = useYearState()
  const navigate = useNavigate()
  const [sourceId, setSourceId] = useState(year?.id ?? '')
  const [newYear, setNewYear] = useState(String((year?.year ?? 2026) + 1))
  const [opening, setOpening] = useState('0')
  const [error, setError] = useState<string | null>(null)

  async function copy() {
    const openingSavings = parseAmount(opening)
    const y = Number(newYear)
    if (!sourceId || !y || openingSavings === null) return
    try {
      await copyYearTemplate({ sourceYearId: sourceId, newYear: y, openingSavings })
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo copiar')
    }
  }

  return (
    <>
      <ScreenHeader title="Copiar plantilla" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <p className="text-sm text-ink/70 mb-3">
        Copia categorías, ingresos y recurrentes. No copia movimientos ni facturas.
      </p>
      <Card>
        <Field label="Desde el año">
          <select className={inputClass} value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nuevo año">
          <input className={inputClass} inputMode="numeric" value={newYear} onChange={(e) => setNewYear(e.target.value)} />
        </Field>
        <Field label="Ahorro inicial del año nuevo">
          <input className={inputClass} inputMode="decimal" value={opening} onChange={(e) => setOpening(e.target.value)} />
        </Field>
        {error ? <p className="text-danger text-sm mb-2">{error}</p> : null}
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => void copy()}>
          Crear año
        </button>
      </Card>
    </>
  )
}
