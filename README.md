# Gastos Bending

PWA de control de gastos personales, pensada para el móvil. **Sin cuentas, sin servidor y sin `.env`**: todo se guarda en IndexedDB del navegador.

Sirve para llevar una hoja anual (meses en columnas, conceptos en filas), registrar movimientos al vuelo, recurrentes, facturas de suministros y un bloque aparte para un segundo inmueble.

## Requisitos

- Node.js 20 o superior

## Uso local

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (por defecto `http://localhost:5173`) en el móvil de la misma red o usa las herramientas de dispositivo del navegador.

Para producción:

```bash
npm run build
npm run preview
```

La carpeta `dist/` se puede publicar en **GitHub Pages**, **Cloudflare Pages** o cualquier hosting estático. La app usa rutas con `#` (`/#/mes`) para que el hosting estático no necesite redirecciones.

## Primer arranque

Al abrir la app, un asistente pide:

- Año
- Ingreso neto mensual (luego puedes partirlo en periodos si el sueldo cambia)
- Ahorro a 1 de enero
- Número de personas que comparten gas/luz/agua

Se crea una plantilla de categorías (fijos, ocio, ahorro y ZGZ) que puedes editar.

## Datos

| Qué | Dónde |
| --- | --- |
| Gastos, categorías, ajustes | IndexedDB en **este** navegador/dispositivo |
| Backup / otro dispositivo | **Más → Copia de seguridad** → exportar o importar JSON |
| Copia de seguridad | [`recursos/gastos-bending-2026-10-04.json`](recursos/gastos-bending-2026-10-04.json) (importable; hojas 2025 y 2026) |
| Demo | En la misma pantalla, “Cargar datos de ejemplo” (importes ficticios) |

No hay sincronización en la nube. Si cambias de móvil o de navegador, importa el JSON.

## Qué incluye

- Botón **+** para un movimiento (importe, categoría, fecha)
- Vista **mes** (totales, lista, pendientes de recurrentes)
- Vista **año** (cuadrícula tipo hoja, columna de concepto fija, % sobre ingreso anual)
- Recurrentes que generan movimientos a confirmar
- Suministros: cada factura se divide entre N personas (por defecto el valor de Ajustes) → fila de fijos
- **ZGZ**: gastos que no entran en fijos/ocio y cálculo de **A devolver**
- Multi-año y copia de plantilla (categorías e ingresos, no movimientos)

Los gráficos quedan fuera de esta versión; el inicio muestra KPIs numéricos.

## Tests

```bash
npm test
```

Cubre cálculos de ingreso por periodo, celdas vacías/cero, saldo de ahorro, cuota de factura y “A devolver”.
