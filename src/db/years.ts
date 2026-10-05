import { completeOnboarding, copyYearTemplate, loadDemoData } from './actions'
import { db } from './db'
import { findSeedLinks } from './seed'

export async function switchActiveYear(yearId: string): Promise<void> {
  const categories = await db.categories.where('yearId').equals(yearId).toArray()
  await db.settings.update('global', {
    activeYearId: yearId,
    ...findSeedLinks(categories),
  })
}

export { completeOnboarding, copyYearTemplate, loadDemoData }
