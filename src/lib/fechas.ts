const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const formatoBogota = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Fecha de hoy en Bogotá, "yyyy-MM-dd". No usa toISOString (UTC). */
export function hoyBogota(): string {
  const partes = Object.fromEntries(
    formatoBogota.formatToParts(new Date()).map((p) => [p.type, p.value]),
  )
  return `${partes.year}-${partes.month}-${partes.day}`
}

/** Suma días a una fecha "yyyy-MM-dd" sin depender de la zona local. */
export function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10)
}

/** "2026-11-03" → "3 de noviembre", sin pasar por Date. */
export function formatearFecha(iso: string): string {
  const [, mes, dia] = iso.split('-').map(Number)
  return `${dia} de ${MESES[mes - 1]}`
}
