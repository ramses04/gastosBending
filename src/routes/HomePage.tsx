import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Amount, Percent } from '../components/Amount'
import { Card, ScreenHeader } from '../components/ui'
import { MONTHS, defaultMonthForYear } from '../domain/calendar'
import { monthTotals, spendExcludingSavings, yearTotals } from '../domain/sheet'
import { useYearState } from '../state/YearContext'

export function HomePage() {
  const { year, categories, incomePeriods, movements, settings } = useYearState()
  if (!year || !settings) return null

  const month = defaultMonthForYear(year.year)
  const mt = monthTotals(movements, categories, incomePeriods, year.year, month)
  const yt = yearTotals(movements, categories, incomePeriods, year.openingSavings)
  const spentMonth = spendExcludingSavings(
    movements.filter((m) => m.date.startsWith(`${year.year}-${String(month).padStart(2, '0')}`)),
    categories,
  )

  return (
    <>
      <ScreenHeader
        title={`${year.year}`}
        subtitle={`Actualizado ${formatUpdated(year.updatedAt)}`}
        action={
          <Link to="/mas/ajustes" className="text-sm underline">
            Año
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Kpi title={`Ingreso ${MONTHS[month - 1]}`} value={<Amount value={mt.income} />} />
        <Kpi title="Gastado este mes" value={<Amount value={spentMonth} />} />
        <Kpi title="Ahorro del mes" value={<Amount value={mt.savings} />} />
        <Kpi title="Saldo ahorro" value={<Amount value={yt.currentSavings} />} />
      </div>
      <Card className="mb-3">
        <h2 className="font-medium mb-3">Este mes</h2>
        <Row label="Fijos" amount={mt.fixed} pct={mt.fixedPct} tone="bg-fixed/40" />
        <Row label="Ocio" amount={mt.leisure} pct={mt.leisurePct} tone="bg-leisure/50" />
        <Row label="Ahorro" amount={mt.savings} pct={mt.savingsPct} tone="bg-savings/50" />
      </Card>
      <Card>
        <h2 className="font-medium mb-3">Acumulado {year.year}</h2>
        <Row label="Fijos" amount={yt.fixed} pct={yt.fixedPct} tone="bg-fixed/40" />
        <Row label="Ocio" amount={yt.leisure} pct={yt.leisurePct} tone="bg-leisure/50" />
        <Row label="Ahorro" amount={yt.savings} pct={yt.savingsPct} tone="bg-savings/50" />
        <p className="text-xs text-ink/55 mt-3">
          Inicio {yt.openingSavings.toLocaleString('es-ES')} € · ingreso anual {yt.income.toLocaleString('es-ES')} €
        </p>
      </Card>
    </>
  )
}

function formatUpdated(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!d) return iso
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${Number(d)}-${months[Number(m) - 1]}-${y}`
}

function Kpi({ title, value }: { title: string; value: ReactNode }) {
  return (
    <Card>
      <p className="text-xs text-ink/55 mb-1">{title}</p>
      <div className="text-lg font-semibold">{value}</div>
    </Card>
  )
}

function Row({
  label,
  amount,
  pct,
  tone,
}: {
  label: string
  amount: number
  pct: number
  tone: string
}) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-3 py-2 mb-2 last:mb-0 ${tone}`}>
      <span>{label}</span>
      <span className="flex gap-3">
        <Amount value={amount} />
        <Percent ratio={pct} />
      </span>
    </div>
  )
}
