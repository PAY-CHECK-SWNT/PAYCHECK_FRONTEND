import type { Categoria, CategoriaGasto, CategoriaIngreso } from '../api/tipos'

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

export const CATEGORIAS_GASTO: CategoriaGasto[] = [
  'COMIDA',
  'TRANSPORTE',
  'OCIO',
  'COMPRAS',
  'EDUCACION',
  'SALUD',
  'GASTOS_FIJOS',
  'OTROS',
]

export const CATEGORIAS_INGRESO: CategoriaIngreso[] = ['MESADA', 'TRABAJO', 'OTROS_INGRESOS']

/** "GASTOS_FIJOS" → "Gastos fijos" */
export function etiqueta(categoria: Categoria): string {
  return ETIQUETAS[categoria]
}
