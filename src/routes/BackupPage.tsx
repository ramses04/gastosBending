import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, ScreenHeader, btnGhost, btnPrimary } from '../components/ui'
import { exportBackup, importBackup, parseBackup } from '../db/backup'
import { loadDemoData } from '../db/actions'

export function BackupPage() {
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function download() {
    const payload = await exportBackup()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gastos-bending-${payload.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Copia descargada')
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    try {
      const text = await file.text()
      await importBackup(parseBackup(text))
      setError(null)
      setMsg('Datos restaurados. Recarga si algo no se actualiza.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo importar')
    }
  }

  async function demo() {
    try {
      await loadDemoData()
      setMsg('Datos de ejemplo añadidos al año activo')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el ejemplo')
    }
  }

  return (
    <>
      <ScreenHeader title="Copia de seguridad" action={<Link to="/mas" className="text-sm underline">Volver</Link>} />
      <p className="text-sm text-ink/70 mb-3">
        Los datos viven solo en este navegador. Exporta un JSON para copiarlos a otro móvil o como backup.
      </p>
      <Card className="mb-3 space-y-3">
        <button type="button" className={`${btnPrimary} w-full`} onClick={() => void download()}>
          Exportar JSON
        </button>
        <label className={`${btnGhost} w-full cursor-pointer`}>
          Importar JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </label>
        <button type="button" className={`${btnGhost} w-full`} onClick={() => void demo()}>
          Cargar datos de ejemplo
        </button>
      </Card>
      {msg ? <p className="text-sm">{msg}</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}
    </>
  )
}
