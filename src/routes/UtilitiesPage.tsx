import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Amount } from '../components/Amount'
import { Card, Field, ScreenHeader, btnPrimary, inputClass } from '../components/ui'
import { db } from '../db/db'
import { deleteUtilityBill, upsertUtilityMovement } from '../db/utilitySync'
import { MONTHS } from '../domain/calendar'
import { parseAmount } from '../domain/money'
import { peopleForBill, utilityShare } from '../domain/utilities'
import { newId, todayIso } from '../lib/ids'
import { useYearState } from '../state/YearContext'
import type { AppSettings, UtilityBill, UtilityKind, YearRecord } from '../db/types'

const KINDS: { id: UtilityKind; label: string }[] = [
  { id: 'gas', label: 'Gas' },
  { id: 'luz', label: 'Luz' },
  { id: 'agua', label: 'Agua' },
]

export function UtilitiesPage() {
  const { year, settings, utilityBills } = useYearState()
  const defaultSplit = settings?.utilitiesSplit ?? 1
  const [kind, setKind] = useState<UtilityKind>('luz')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [amount, setAmount] = useState('')
  const [split, setSplit] = useState(String(defaultSplit))

  async function add() {
    if (!year || !settings) return
    const value = parseAmount(amount)
    const people = Number(split.replace(',', '.'))
    if (value === null || !people) return
    const bill: UtilityBill = {
      id: newId(),
      yearId: year.id,
      kind,
      month: Number(month) || 1,
      amount: value,
      split: people,
    }
    await db.utilityBills.add(bill)
    await upsertUtilityMovement(bill, year, settings)
    await db.years.update(year.id, { updatedAt: todayIso() })
    setAmount('')
    setSplit(String(defaultSplit))
  }

  return (
    <>
      <ScreenHeader title="Suministros" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <p className="text-sm text-ink/70 mb-3">
        Cada factura indica entre cuántas personas se divide. El valor por defecto es el de Ajustes (
        {defaultSplit}).
      </p>
      <Card className="mb-4">
        <Field label="Tipo">
          <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as UtilityKind)}>
            {KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mes en que llega">
          <select className={inputClass} value={month} onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Importe de la factura">
          <input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Se divide entre (personas)">
          <input className={inputClass} inputMode="decimal" value={split} onChange={(e) => setSplit(e.target.value)} />
        </Field>
        {parseAmount(amount) !== null && Number(split.replace(',', '.')) > 0 ? (
          <p className="text-sm mb-3">
            Tu cuota:{' '}
            <Amount value={utilityShare(parseAmount(amount) ?? 0, Number(split.replace(',', '.')))} />
          </p>
        ) : null}
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => void add()}>
          Registrar factura
        </button>
      </Card>
      <ul className="space-y-2">
        {utilityBills
          .slice()
          .sort((a, b) => a.month - b.month)
          .map((b) => (
            <BillRow
              key={b.id}
              bill={b}
              year={year}
              settings={settings}
              defaultSplit={defaultSplit}
            />
          ))}
      </ul>
    </>
  )
}

function BillRow({
  bill,
  year,
  settings,
  defaultSplit,
}: {
  bill: UtilityBill
  year: YearRecord | undefined
  settings: AppSettings | undefined
  defaultSplit: number
}) {
  const people = peopleForBill(bill, defaultSplit)
  const [splitDraft, setSplitDraft] = useState(String(people))

  async function saveSplit() {
    if (!year || !settings) return
    const next = Number(splitDraft.replace(',', '.'))
    if (!next) return
    const updated = { ...bill, split: next }
    await db.utilityBills.update(bill.id, { split: next })
    await upsertUtilityMovement(updated, year, settings)
  }

  return (
    <li className="rounded-2xl bg-white/80 border border-ink/5 p-3">
      <div className="flex justify-between gap-2">
        <div>
          <p className="font-medium capitalize">
            {bill.kind} · {MONTHS[bill.month - 1]}
          </p>
          <p className="text-sm text-ink/60">
            Factura <Amount value={bill.amount} /> · cuota{' '}
            <Amount value={utilityShare(bill.amount, people)} />
          </p>
        </div>
        <button type="button" className="text-danger text-sm underline shrink-0" onClick={() => void deleteUtilityBill(bill.id)}>
          Borrar
        </button>
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm">
        <span className="shrink-0">Divide entre</span>
        <input
          className={`${inputClass} py-1 max-w-20`}
          inputMode="decimal"
          value={splitDraft}
          onChange={(e) => setSplitDraft(e.target.value)}
          onBlur={() => void saveSplit()}
        />
        <span className="text-ink/55">personas</span>
      </label>
    </li>
  )
}
