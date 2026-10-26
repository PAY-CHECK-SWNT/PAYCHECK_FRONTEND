import { hoyBogota, sumarDias } from '../../lib/fechas'

export const claseInput =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-base disabled:bg-slate-100 disabled:text-slate-400'

/** Límites de la fecha del próximo ingreso: desde mañana hasta hoy + 62. */
export function limitesFechaIngreso(): { min: string; max: string } {
  const hoy = hoyBogota()
  return { min: sumarDias(hoy, 1), max: sumarDias(hoy, 62) }
}

/** Devuelve el mensaje de error, o undefined si la fecha es válida. */
export function validarFechaIngreso(
  fecha: string,
  noSe: boolean,
  min: string,
  max: string,
): string | undefined {
  if (noSe) return undefined
  if (!fecha) return 'Elige la fecha de tu próximo ingreso.'
  if (fecha < min) return 'Debe ser posterior a hoy.'
  if (fecha > max) return 'Debe estar dentro de los próximos 62 días.'
  return undefined
}
