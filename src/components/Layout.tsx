import { NavLink, Outlet } from 'react-router-dom'
import { ExpenseFab } from './ExpenseFab'

const tabs = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/mes', label: 'Mes' },
  { to: '/ano', label: 'Año' },
  { to: '/mas', label: 'Más' },
]

export function Layout() {
  return (
    <div className="min-h-dvh">
      <main className="safe-bottom mx-auto max-w-lg px-4 pt-4">
        <Outlet />
      </main>
      <ExpenseFab />
      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-ink/10 bg-paper/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-lg grid grid-cols-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `py-3 text-center text-sm font-medium ${isActive ? 'text-ink' : 'text-ink/45'}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
