import type { ReactNode } from 'react'

export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-ink/70 mt-0.5">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl bg-white/80 shadow-sm border border-ink/5 p-4 ${className}`}>
      {children}
    </section>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 min-h-11 outline-none focus:border-ink/40'

export const btnPrimary =
  'inline-flex items-center justify-center rounded-xl bg-ink text-paper px-4 py-2.5 min-h-11 font-medium disabled:opacity-40'

export const btnGhost =
  'inline-flex items-center justify-center rounded-xl border border-ink/15 px-4 py-2.5 min-h-11 font-medium'
