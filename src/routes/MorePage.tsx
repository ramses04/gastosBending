import { Link } from 'react-router-dom'
import { ScreenHeader } from '../components/ui'
import { hasZgzData } from '../domain/zgz'
import { useYearState } from '../state/YearContext'

const links = [
  { to: '/mas/categorias', title: 'Categorías', desc: 'Renombrar, vigencia, archivar' },
  { to: '/mas/ingresos', title: 'Ingresos', desc: 'Sueldo por meses o rangos' },
  { to: '/mas/recurrentes', title: 'Recurrentes', desc: 'Renta, suscripciones…' },
  { to: '/mas/suministros', title: 'Suministros', desc: 'Facturas de gas, luz y agua' },
  { to: '/mas/zgz', title: 'ZGZ', desc: 'Segundo inmueble y A devolver' },
  { to: '/mas/ajustes', title: 'Ajustes', desc: 'Año activo, divisor, fecha' },
  { to: '/mas/copia', title: 'Copiar plantilla', desc: 'Nuevo año sin movimientos' },
  { to: '/mas/copia-seguridad', title: 'Copia de seguridad', desc: 'Exportar e importar JSON' },
]

export function MorePage() {
  const { year, categories } = useYearState()
  const items = hasZgzData(categories) ? links : links.filter((item) => item.to !== '/mas/zgz')
  return (
    <>
      <ScreenHeader title="Más" subtitle={year ? `Año ${year.year}` : undefined} />
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="block rounded-2xl bg-white/80 border border-ink/5 px-4 py-3"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-ink/60">{item.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
