import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Field, ScreenHeader, btnGhost, btnPrimary, inputClass } from '../components/ui'
import { db } from '../db/db'
import type { Category, CategoryGroup } from '../db/types'
import { hasZgzData } from '../domain/zgz'
import { newId } from '../lib/ids'
import { useYearState } from '../state/YearContext'

const GROUPS: { id: CategoryGroup; label: string }[] = [
  { id: 'fixed', label: 'Fijos' },
  { id: 'leisure', label: 'Ocio' },
  { id: 'savings', label: 'Ahorro' },
  { id: 'zgz', label: 'ZGZ' },
]

const COLORS: Record<CategoryGroup, string> = {
  fixed: '#e8a598',
  leisure: '#f3d77a',
  savings: '#8fbc8f',
  zgz: '#7ba3b8',
}

export function CategoriesPage() {
  const { year, categories } = useYearState()
  const [name, setName] = useState('')
  const [group, setGroup] = useState<CategoryGroup>('leisure')
  const [from, setFrom] = useState('1')
  const [to, setTo] = useState('12')
  const [openGroup, setOpenGroup] = useState<CategoryGroup | null>(null)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const showZgz = hasZgzData(categories)
  const groups = showZgz ? GROUPS : GROUPS.filter((g) => g.id !== 'zgz')

  async function add() {
    if (!year || !name.trim()) return
    await db.categories.add({
      id: newId(),
      yearId: year.id,
      name: name.trim(),
      group,
      color: COLORS[group],
      sortOrder: categories.length,
      validFrom: Number(from) || 1,
      validTo: Number(to) || 12,
      archived: false,
    })
    setName('')
    setOpenGroup(group)
  }

  return (
    <>
      <ScreenHeader title="Categorías" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <Card className="mb-4">
        <Field label="Nueva categoría">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <select className={inputClass} value={group} onChange={(e) => setGroup(e.target.value as CategoryGroup)}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <input className={inputClass} inputMode="numeric" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Desde mes" />
          <input className={inputClass} inputMode="numeric" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Hasta mes" />
        </div>
        <button type="button" className={`${btnPrimary} mt-3 w-full`} onClick={() => void add()}>
          Añadir
        </button>
      </Card>
      <div className="space-y-2">
        {groups.map((g) => {
          const list = categories.filter((c) => c.group === g.id).sort((a, b) => a.sortOrder - b.sortOrder)
          if (!list.length) return null
          const expanded = openGroup === g.id
          return (
            <section key={g.id} className="rounded-2xl border border-ink/15 bg-white overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-2 px-4 py-3 min-h-11 text-left"
                onClick={() => setOpenGroup(expanded ? null : g.id)}
                aria-expanded={expanded}
              >
                <span className="font-medium">
                  {g.label}
                  <span className="ml-2 text-sm font-normal text-ink/50">{list.length}</span>
                </span>
                <span className="text-ink/40 text-sm">{expanded ? '▴' : '▾'}</span>
              </button>
              {expanded ? (
                <ul className="border-t border-ink/10">
                  {list.map((c) => (
                    <CategoryRow
                      key={c.id}
                      category={c}
                      showZgz={showZgz}
                      expanded={openCategoryId === c.id}
                      onToggle={() => setOpenCategoryId((id) => (id === c.id ? null : c.id))}
                    />
                  ))}
                </ul>
              ) : null}
            </section>
          )
        })}
      </div>
    </>
  )
}

async function toggleMortgage(category: Category) {
  const next = !category.isMortgage
  const siblings = await db.categories.where('yearId').equals(category.yearId).toArray()
  await db.transaction('rw', db.categories, db.settings, async () => {
    for (const c of siblings) {
      if (c.group === 'fixed' && c.isMortgage) {
        await db.categories.update(c.id, { isMortgage: false })
      }
    }
    await db.categories.update(category.id, { isMortgage: next })
    await db.settings.update('global', { mortgageCategoryId: next ? category.id : null })
  })
}

function CategoryRow({
  category,
  showZgz,
  expanded,
  onToggle,
}: {
  category: Category
  showZgz: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const [name, setName] = useState(category.name)
  const [from, setFrom] = useState(String(category.validFrom))
  const [to, setTo] = useState(String(category.validTo))

  async function save() {
    await db.categories.update(category.id, {
      name: name.trim() || category.name,
      validFrom: Number(from) || 1,
      validTo: Number(to) || 12,
    })
  }

  return (
    <li className="border-t border-ink/5 first:border-t-0">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 min-h-11 text-left"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className={category.archived ? 'text-ink/45 line-through' : ''}>{category.name}</span>
        <span className="text-ink/40 text-sm">{expanded ? '▴' : '▾'}</span>
      </button>
      {expanded ? (
        <div className="px-4 pb-3">
          <input className={`${inputClass} mb-2`} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => void save()} />
          <div className="flex gap-2 items-center text-sm">
            <span>Vigente</span>
            <input className={`${inputClass} py-1`} value={from} onChange={(e) => setFrom(e.target.value)} onBlur={() => void save()} />
            <span>—</span>
            <input className={`${inputClass} py-1`} value={to} onChange={(e) => setTo(e.target.value)} onBlur={() => void save()} />
          </div>
          <div className="flex gap-3 mt-2 text-sm">
            <button
              type="button"
              className="underline"
              onClick={() => void db.categories.update(category.id, { archived: !category.archived })}
            >
              {category.archived ? 'Restaurar' : 'Archivar'}
            </button>
            {showZgz && category.isMortgage ? <span className="text-ink/50">Hipoteca ZGZ</span> : null}
            {category.linkedUtility ? <span className="text-ink/50">Suministro {category.linkedUtility}</span> : null}
            {showZgz ? (
              <button
                type="button"
                className={`${btnGhost} ml-auto py-1 px-2 min-h-8 text-xs`}
                onClick={() => void toggleMortgage(category)}
              >
                {category.isMortgage ? 'Quitar hipoteca' : 'Marcar hipoteca'}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  )
}
