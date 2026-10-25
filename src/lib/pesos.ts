const formato = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

/** 15000 → "$15.000" */
export function formatearPesos(valor: number): string {
  return formato.format(valor).replace(/\s/g, '')
}

/** "600000" → "600.000". Descarta todo lo que no sea dígito; para mostrar mientras se escribe. */
export function formatearMilesInput(texto: string): string {
  const digitos = texto.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** "15.000" o "15000" → 15000. Texto inválido → null. */
export function parsearMonto(texto: string): number | null {
  const limpio = texto.replace(/[\s$]/g, '')
  if (!/^\d{1,3}(\.\d{3})+$|^\d+$/.test(limpio)) return null
  return Number(limpio.replace(/\./g, ''))
}
