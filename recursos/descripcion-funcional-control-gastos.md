# Descripción funcional de la plantilla de control de gastos

Documento base para el prompt de creación de la webapp móvil.

---

## 1. Visión general

Hoja anual (2026) de control de gastos personales con **una columna por mes (enero–diciembre)** y **una fila por concepto**. Muestra totales mensuales y anuales, porcentajes sobre el ingreso neto, un seguimiento del ahorro acumulado y bloques auxiliares para facturas de suministros y gastos de un segundo inmueble. Tiene una fecha manual de "actualizado" (ej. 3-oct) arriba a la izquierda.

---

## 2. Parámetros globales

- **Ingreso neto mensual:** un valor (2058 €) que sirve de base para todos los porcentajes.
- **Notas de salario:** anotaciones tipo "33k desde 05 / 29k hasta 04", es decir, el sueldo cambió a mitad de año. La app debe permitir **ingreso neto con histórico** (valor por mes o por rango de fechas) y notas.
- **Año:** la hoja se identifica por año (2026).
- **Ahorro inicial (8695 €):** saldo de ahorro a 1 de enero.

---

## 3. Gastos por categoría y mes

Cada celda es un importe en € (vacío = sin dato, 0 = explícitamente cero). Hay tres grupos, diferenciados por color:

### Gastos fijos (color salmón)

Renta, Transporte, Internet/tlf, Amazon Prime, Glovo (hasta junio) / Hipoteca (desde julio), Acens, Gas, Luz, Agua, YouTube, Cursor, Préstamo piso, Préstamo moto, Seguros.

### Ahorro (color verde)

Una fila con el ahorro real de cada mes, introducido manualmente. Puede ser **negativo** (ej. -8572 en mayo, por una salida grande de ahorros; -3716 en julio).

### Ocio / gasto variable (color amarillo)

Mercado, Comida, Delivery, Compras, Misceláneos, Ayuda, Viajes, Sputnik, Juegos, Regalos, Acciona, Gasolina.

### Observaciones para la app

- Los conceptos **cambian a lo largo del año** (una fila cambia de significado: Glovo → Hipoteca). La app debe permitir renombrar, crear, archivar y reasignar categorías, con vigencia por fechas.
- Hay gastos **recurrentes con importe fijo** (Renta 373 €, YouTube 26 €, Cursor 22 €…) que se repiten cada mes. La app debe permitir recurrencias, con posibilidad de cambiar el importe a partir de un mes (la renta sube a 513 en julio).
- Hay **gastos puntuales** o de temporada, como viajes o compras.

---

## 4. Columna de porcentaje por concepto (%)

Al final de cada fila: el total anual acumulado del concepto expresado en % sobre el ingreso acumulado (ej. Renta 22,6 %, Compras 24 %, Viajes 17,7 %). Sirve para ver qué conceptos pesan más. en contraste al ingreso neto anual 

---

## 5. Totales mensuales

Tres filas por mes:

- **Gastos fijos** = suma de todas las filas de gastos fijos.
- **Ocio** = suma de todas las filas de ocio.
- **Ahorro** = valor de la fila de ahorro.

---

## 6. Porcentajes mensuales sobre el ingreso neto

Para cada mes: gastos fijos %, ocio % y ahorro % = total del grupo ÷ ingreso neto × 100. Ejemplos: enero fijos 27,8 %, ocio 55,9 %, ahorro 1,2 %.

Se observan valores que superan el 100 % (ocio 123,7 % en agosto) y valores negativos de ahorro; la app debe manejarlos y resaltarlos (por ejemplo, en rojo).

---

## 7. Resumen anual (cuadro "Porcentajes")

Tres indicadores acumulados del año: **gastos fijos %** (40,9), **ocio %** (78,7) y **ahorro %** (-42,0). Todos son porcentaje sobre el ingreso acumulado.

---

## 8. Seguimiento del ahorro

- **Inicio ahorro:** saldo inicial (8695).
- **Total ahorros:** saldo actual = inicio + suma de los ahorros mensuales (con los datos actuales: 8695 − 7195 = 1500).

---

## 9. Bloque "Total servicios" (facturas de gas, luz y agua)

Aquí se registra el **importe real de cada factura** en el mes en que llega (ej. gas febrero 107,34; luz marzo 57,43; agua abril 52,88). Estas facturas son irregulares (no llegan todos los meses).

**Relación con los gastos fijos:** la fila mensual de gas/luz/agua en gastos fijos recoge **la factura dividida entre 3** (107,34 / 3 = 35,78; 120,15 / 3 = 40,05; 46,98 / 3 = 15,66…). esto es asi por a cantidad de personas que comparten el piso, debe ser configurable

---

## 10. Bloque "ZGZ" (segundo inmueble) 

NOTA: este bloque deberia ser una funcionalidad aparte al resto de bloques, se compone de los Gastos de otra vivienda por mes: gas, luz, agua, comunidad, seguros. Una fila final, **"A devolver"**, con el importe pendiente de devolver por mes. Este total se calcula restandole al valor de la renta de del primer piso(debe ser configurable, actualmente 1119,68) la sumatoria del valor de la hipoteca que aparece en la seccion de Gastos fijos y los gastos el segundo inmueble.

Estos gastos **no entran** en los totales de gastos fijos/ocio.

---

## 11. Convenciones visuales

NOTA: estas son flexibles, prioriza un buen aspecto visual que vaya bien en la web movil

- Colores: salmón (fijos), amarillo (ocio), verde (ahorro), azul claro (cabeceras y bloques de resumen).
- Valores negativos, ahorro negativo y porcentajes altos destacados.
- Meses futuros con algunas filas prerrellenadas (renta) y el resto vacío o a 0.

---

# Funcionalidades nuevas propuestas

## Entrada de datos (móvil primero)

- Botón flotante "+ gasto" para registrar en 3 toques: importe, categoría, fecha (por defecto hoy), nota opcional.
- Lista de movimientos editable y filtrable por mes, categoría y grupo. Los totales de la cuadrícula se calculan a partir de ellos (con edición directa de la celda mensual como alternativa).
- Gastos recurrentes automáticos, con aviso de "pendiente de confirmar".
- Soporte offline (PWA instalable) con sincronización.

## Análisis

- Vista mensual (detalle del mes) y vista anual (cuadrícula tipo Excel con scroll horizontal y columna de concepto fija).
- Gráficos: evolución mensual por grupo, reparto por categoría, ahorro acumulado.
- Comparativa mes a mes y año a año.
- Dashboard con KPIs: ingreso, gastado, ahorro, % de cada grupo, saldo de ahorro.

## Datos y configuración

- Multi-año con selector de año y copia de plantilla de un año a otro.
- Categorías y grupos personalizables, con colores.
- Ingresos por mes (varios ingresos, histórico de sueldo).

