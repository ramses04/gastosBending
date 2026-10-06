import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, ScreenHeader, btnPrimary, inputClass } from '../components/ui'
import { db } from '../db/db'
import { switchActiveYear } from '../db/years'
import { parseAmount } from '../domain/money'
import { hasZgzData } from '../domain/zgz'
import { todayIso } from '../lib/ids'
import { useYearState } from '../state/YearContext'

export function SettingsPage() {
  const { year, years, settings, categories } = useYearState()
  const showZgz = hasZgzData(categories)
  const [updatedAt, setUpdatedAt] = useState(year?.updatedAt ?? todayIso())
  const [opening, setOpening] = useState(String(year?.openingSavings ?? 0).replace('.', ','))
  const [split, setSplit] = useState(String(settings?.utilitiesSplit ?? 1))
  const [rent, setRent] = useState(String(settings?.zgzReferenceRent ?? 0).replace('.', ','))
  const [msg, setMsg] = useState<string | null>(null)

  if (!year || !settings) return null
  const activeYear = year

  async function save() {
    const openingSavings = parseAmount(opening)
    const utilitiesSplit = Number(split.replace(',', '.'))
    const zgzReferenceRent = showZgz ? parseAmount(rent) : (settings.zgzReferenceRent ?? 0)
    if (openingSavings === null || !utilitiesSplit || zgzReferenceRent === null) return
    await db.years.update(activeYear.id, { openingSavings, updatedAt })
    await db.settings.update('global', { utilitiesSplit, zgzReferenceRent })
    setMsg('Guardado')
  }

  return (
    <>
      <ScreenHeader title="Ajustes" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <Card className="mb-4">
        <Field label="Año activo">
          <select
            className={inputClass}
            value={year.id}
            onChange={(e) => void switchActiveYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha actualizado">
          <input type="date" className={inputClass} value={updatedAt} onChange={(e) => setUpdatedAt(e.target.value)} />
        </Field>
        <Field label="Ahorro inicial">
          <input className={inputClass} inputMode="decimal" value={opening} onChange={(e) => setOpening(e.target.value)} />
        </Field>
        <Field label="Personas por defecto en facturas nuevas">
          <input className={inputClass} inputMode="decimal" value={split} onChange={(e) => setSplit(e.target.value)} />
        </Field>
        {showZgz ? (
          <Field label="Renta de referencia ZGZ">
            <input className={inputClass} inputMode="decimal" value={rent} onChange={(e) => setRent(e.target.value)} />
          </Field>
        ) : null}
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => void save()}>
          Guardar
        </button>
        {msg ? <p className="text-sm mt-2">{msg}</p> : null}
      </Card>
    </>
  )
}
