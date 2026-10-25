import type { Categoria } from '../api/tipos'

const ETIQUETAS: Record<Categoria, string> = {
  COMIDA: 'Comida',
  TRANSPORTE: 'Transporte',
  OCIO: 'Ocio',
  COMPRAS: 'Compras',
  EDUCACION: 'Educación',
  SALUD: 'Salud',
  GASTOS_FIJOS: 'Gastos fijos',
  OTROS: 'Otros',
  MESADA: 'Mesada',
  TRABAJO: 'Trabajo',
  OTROS_INGRESOS: 'Otros ingresos',
}

/** "GASTOS_FIJOS" → "Gastos fijos" */
export function etiqueta(categoria: Categoria): string {
  return ETIQUETAS[categoria]
}
