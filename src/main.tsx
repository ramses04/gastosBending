import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { YearProvider } from './state/YearContext'

window.addEventListener('error', (event) => {
  const root = document.getElementById('root')
  if (root && !root.innerText) {
    root.textContent = event.message
  }
})

if (import.meta.env.PROD) {
  void import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('No se encontró #root')
}

try {
  createRoot(rootEl).render(
    <StrictMode>
      <HashRouter>
        <YearProvider>
          <App />
        </YearProvider>
      </HashRouter>
    </StrictMode>,
  )
} catch (error) {
  rootEl.textContent = error instanceof Error ? error.message : String(error)
}
