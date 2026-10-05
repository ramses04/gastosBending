import { formatMoney, formatPct, isAlertPercent, isNegative } from '../domain/money'

export function Amount({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  const alert = isNegative(value)
  return (
    <span className={`${alert ? 'text-danger font-semibold' : ''} ${className}`}>
      {formatMoney(value)}
    </span>
  )
}

export function Percent({
  ratio,
  className = '',
}: {
  ratio: number
  className?: string
}) {
  const alert = isAlertPercent(ratio) || (Number.isFinite(ratio) && ratio < 0)
  return (
    <span className={`${alert ? 'text-danger font-semibold' : ''} ${className}`}>
      {formatPct(ratio)}
    </span>
  )
}
