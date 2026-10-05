import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useYearState } from './state/YearContext'
import { WizardPage } from './routes/WizardPage'
import { HomePage } from './routes/HomePage'
import { MonthPage } from './routes/MonthPage'
import { YearPage } from './routes/YearPage'
import { MorePage } from './routes/MorePage'
import { CategoriesPage } from './routes/CategoriesPage'
import { IncomesPage } from './routes/IncomesPage'
import { RecurrencesPage } from './routes/RecurrencesPage'
import { UtilitiesPage } from './routes/UtilitiesPage'
import { ZgzPage } from './routes/ZgzPage'
import { SettingsPage } from './routes/SettingsPage'
import { BackupPage } from './routes/BackupPage'
import { CopyYearPage } from './routes/CopyYearPage'

export default function App() {
  const { ready, settings } = useYearState()

  if (!ready) {
    return (
      <div className="min-h-dvh grid place-items-center text-ink/70">Cargando…</div>
    )
  }

  if (!settings?.onboardingComplete) {
    return <WizardPage />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/mes" element={<MonthPage />} />
        <Route path="/mes/:month" element={<MonthPage />} />
        <Route path="/ano" element={<YearPage />} />
        <Route path="/mas" element={<MorePage />} />
        <Route path="/mas/categorias" element={<CategoriesPage />} />
        <Route path="/mas/ingresos" element={<IncomesPage />} />
        <Route path="/mas/recurrentes" element={<RecurrencesPage />} />
        <Route path="/mas/suministros" element={<UtilitiesPage />} />
        <Route path="/mas/zgz" element={<ZgzPage />} />
        <Route path="/mas/ajustes" element={<SettingsPage />} />
        <Route path="/mas/copia" element={<CopyYearPage />} />
        <Route path="/mas/copia-seguridad" element={<BackupPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
