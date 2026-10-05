import { useMemo, useState } from 'react'
import type { CategoryGroup } from '../db/types'
import { db } from '../db/db'
import { isoDate, monthFromIso, newId, todayIso, yearFromIso } from '../lib/ids'
import { visibleCategoriesForMonth } from '../domain/sheet'
import { parseAmount } from '../domain/money'
import { useYearState } from '../state/YearContext'
import { btnGhost, btnPrimary, inputClass } from './ui'

const GROUP_LABEL: Record<string, string> = {
  fixed: 'Fijos',
  leisure: 'Ocio',
  savings: 'Ahorro',
}

export function ExpenseFab() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-label="Añadir gasto"
        onClick={() => setOpen(true)}
        className="fixed z-40 right-4 bottom-24 h-14 w-14 rounded-full bg-ink text-paper text-3xl shadow-lg leading-none"
      >
        +
      </button>
      {open ? <ExpenseSheet onClose={() => setOpen(false)} /> : null}
    </>
  )
}

export function ExpenseSheet({
  onClose,
  presetCategoryId,
  presetDate,
}: {
  onClose: () => void
  presetCategoryId?: string
  presetDate?: string
}) {
  const { year, categories } = useYearState()
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(presetDate ?? todayIso())
  const [categoryId, setCategoryId] = useState(presetCategoryId ?? '')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const presetGroup = categories.find((c) => c.id === presetCategoryId)?.group
  const [openGroup, setOpenGroup] = useState<CategoryGroup | null>(
    presetGroup && presetGroup !== 'zgz' ? presetGroup : null,
  )

  const month = monthFromIso(date)
  const options = useMemo(
    () =>
      visibleCategoriesForMonth(categories, month).filter(
        (c) => c.group !== 'zgz' && !c.linkedUtility,
      ),
    [categories, month],
  )

  async function save() {
    const value = parseAmount(amount)
    if (value === null) {
      setError('Indica un importe')
      return
    }
    if (!categoryId) {
      setError('Elige una categoría')
      return
    }
    if (!year) return
    if (yearFromIso(date) !== year.year) {
      setError(`La fecha debe ser de ${year.year}`)
      return
    }
    await db.movements.add({
      id: newId(),
      yearId: year.id,
      categoryId,
      date,
      amount: value,
      note: note.trim() || undefined,
      source: 'manual',
      status: 'confirmed',
    })
    await db.years.update(year.id, { updatedAt: todayIso() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/40" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto rounded-t-3xl bg-paper p-4 pb-8 max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Nuevo movimiento</h2>
          <button type="button" className="text-ink/60 px-2 py-1" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <label className="block mb-3">
          <span className="text-sm font-medium">Importe</span>
          <input
            className={`${inputClass} mt-1 text-2xl`}
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            autoFocus
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm font-medium">Fecha</span>
          <input
            type="date"
            className={`${inputClass} mt-1`}
            value={date}
            onChange={(e) => setDate(e.target.value || isoDate(year?.year ?? 2026, 1, 1))}
          />
        </label>
        <p className="text-sm font-medium mb-2">Categoría</p>
        <div className="space-y-2 mb-3">
          {(['fixed', 'leisure', 'savings'] as const).map((group) => {
            const list = options.filter((c) => c.group === group)
            if (!list.length) return null
            const expanded = openGroup === group
            const selected = list.find((c) => c.id === categoryId)
            return (
              <div key={group} className="rounded-xl border border-ink/15 bg-white overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 min-h-11 text-left"
                  onClick={() => setOpenGroup(expanded ? null : group)}
                  aria-expanded={expanded}
                >
                  <span>
                    <span className="font-medium">{GROUP_LABEL[group]}</span>
                    {selected ? (
                      <span className="block text-xs text-ink/55">{selected.name}</span>
                    ) : null}
                  </span>
                  <span className="text-ink/40 text-sm">{expanded ? '▴' : '▾'}</span>
                </button>
                {expanded ? (
                  <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                    {list.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={`rounded-full px-3 py-1.5 text-sm border ${
                          categoryId === c.id ? 'bg-ink text-paper border-ink' : 'border-ink/15 bg-paper'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
        <label className="block mb-4">
          <span className="text-sm font-medium">Nota (opcional)</span>
          <input className={`${inputClass} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        {error ? <p className="text-danger text-sm mb-2">{error}</p> : null}
        <div className="flex gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={`${btnPrimary} flex-1`} onClick={() => void save()}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
