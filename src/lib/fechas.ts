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

/** "2026-11-03" → "3 de noviembre", sin pasar por Date. */
export function formatearFecha(iso: string): string {
  const [, mes, dia] = iso.split('-').map(Number)
  return `${dia} de ${MESES[mes - 1]}`
}
