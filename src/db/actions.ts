import { db, defaultSettings } from './db'
import { buildTemplateCategories, findSeedLinks } from './seed'
import { newId, todayIso } from '../lib/ids'
import type { AppSettings, YearRecord } from './types'

export async function completeOnboarding(input: {
  year: number
  netIncome: number
  openingSavings: number
  utilitiesSplit: number
  incomeNote?: string
}): Promise<void> {
  const yearId = newId()
  const categories = buildTemplateCategories(yearId)
  const links = findSeedLinks(categories)

  const year: YearRecord = {
    id: yearId,
    year: input.year,
    openingSavings: input.openingSavings,
    updatedAt: todayIso(),
  }

  const settings: AppSettings = {
    ...defaultSettings(),
    utilitiesSplit: input.utilitiesSplit,
    activeYearId: yearId,
    onboardingComplete: true,
    ...links,
  }

  await db.transaction(
    'rw',
    [db.settings, db.years, db.categories, db.incomePeriods],
    async () => {
      await db.years.put(year)
      await db.categories.bulkAdd(categories)
      await db.incomePeriods.add({
        id: newId(),
        yearId,
        fromMonth: 1,
        toMonth: 12,
        netAmount: input.netIncome,
        notes: input.incomeNote,
      })
      await db.settings.put(settings)
    },
  )
}

export async function copyYearTemplate(input: {
  sourceYearId: string
  newYear: number
  openingSavings: number
}): Promise<string> {
  const source = await db.years.get(input.sourceYearId)
  if (!source) throw new Error('Año origen no encontrado')

  const existing = await db.years.where('year').equals(input.newYear).first()
  if (existing) throw new Error(`Ya existe el año ${input.newYear}`)

  const [cats, recs, incomes] = await Promise.all([
    db.categories.where('yearId').equals(source.id).toArray(),
    db.recurrences.where('yearId').equals(source.id).toArray(),
    db.incomePeriods.where('yearId').equals(source.id).toArray(),
  ])

  const newYearId = newId()
  const idMap = new Map<string, string>()

  const newCats = cats.map((c) => {
    const id = newId()
    idMap.set(c.id, id)
    return { ...c, id, yearId: newYearId }
  })

  const newRecs = recs.map((r) => ({
    ...r,
    id: newId(),
    yearId: newYearId,
    categoryId: idMap.get(r.categoryId) ?? r.categoryId,
  }))

  const newIncomes = incomes.map((p) => ({
    ...p,
    id: newId(),
    yearId: newYearId,
  }))

  const settings = await db.settings.get('global')

  await db.transaction(
    'rw',
    [db.years, db.categories, db.recurrences, db.incomePeriods, db.settings],
    async () => {
      await db.years.add({
        id: newYearId,
        year: input.newYear,
        openingSavings: input.openingSavings,
        updatedAt: `${input.newYear}-01-01`,
      })
      if (newCats.length) await db.categories.bulkAdd(newCats)
      if (newRecs.length) await db.recurrences.bulkAdd(newRecs)
      if (newIncomes.length) await db.incomePeriods.bulkAdd(newIncomes)
      if (settings) {
        const links = findSeedLinks(newCats)
        await db.settings.update('global', {
          activeYearId: newYearId,
          ...links,
        })
      }
    },
  )

  return newYearId
}

export async function loadDemoData(): Promise<void> {
  const settings = await db.settings.get('global')
  const yearId = settings?.activeYearId
  if (!yearId) throw new Error('Completa el asistente primero')
  const year = await db.years.get(yearId)
  if (!year) throw new Error('Año no encontrado')
  const categories = await db.categories.where('yearId').equals(yearId).toArray()
  const renta = categories.find((c) => c.name === 'Renta' && c.group === 'fixed')
  const mercado = categories.find((c) => c.name === 'Mercado')
  const ahorro = categories.find((c) => c.name === 'Ahorro')
  const youtube = categories.find((c) => c.name === 'YouTube')

  const demo = []
  if (renta) {
    demo.push({
      id: newId(),
      yearId,
      categoryId: renta.id,
      date: `${year.year}-01-01`,
      amount: 373,
      note: 'Ejemplo',
      source: 'manual' as const,
      status: 'confirmed' as const,
    })
  }
  if (youtube) {
    demo.push({
      id: newId(),
      yearId,
      categoryId: youtube.id,
      date: `${year.year}-01-05`,
      amount: 26,
      note: 'Ejemplo',
      source: 'manual' as const,
      status: 'confirmed' as const,
    })
  }
  if (mercado) {
    demo.push({
      id: newId(),
      yearId,
      categoryId: mercado.id,
      date: `${year.year}-01-08`,
      amount: 84.5,
      note: 'Ejemplo',
      source: 'manual' as const,
      status: 'confirmed' as const,
    })
  }
  if (ahorro) {
    demo.push({
      id: newId(),
      yearId,
      categoryId: ahorro.id,
      date: `${year.year}-01-31`,
      amount: 120,
      note: 'Ejemplo',
      source: 'manual' as const,
      status: 'confirmed' as const,
    })
  }

  if (demo.length) await db.movements.bulkAdd(demo)
  const recs = await db.recurrences.where('yearId').equals(yearId).toArray()
  if (renta && !recs.some((r) => r.categoryId === renta.id)) {
    await db.recurrences.add({
      id: newId(),
      yearId,
      categoryId: renta.id,
      amount: 373,
      fromMonth: 1,
      toMonth: 12,
    })
  }
}
