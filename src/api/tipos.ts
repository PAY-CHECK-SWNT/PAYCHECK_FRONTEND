// Tipos idénticos a los JSON de docs/api.md (Sprint 1).

export type TipoMovimiento = 'GASTO' | 'INGRESO'

export type CategoriaGasto =
  | 'COMIDA'
  | 'TRANSPORTE'
  | 'OCIO'
  | 'COMPRAS'
  | 'EDUCACION'
  | 'SALUD'
  | 'GASTOS_FIJOS'
  | 'OTROS'

export type CategoriaIngreso = 'MESADA' | 'TRABAJO' | 'OTROS_INGRESOS'

export type Categoria = CategoriaGasto | CategoriaIngreso

export interface Health {
  estado: 'ok'
}

export interface Ciclo {
  id: number
  saldoInicial: number
  fechaInicio: string
  fechaProximoIngreso: string
  fechaEstimada: boolean
  estado: 'ACTIVO'
}

export interface CrearCicloBody {
  saldoInicial: number
  /** null = "No sé": el backend usa hoy + 30 días. */
  fechaProximoIngreso: string | null
}

export interface ActualizarCicloBody {
  fechaProximoIngreso: string
}

export interface Movimiento {
  id: number
  tipo: TipoMovimiento
  monto: number
  categoria: Categoria
  fecha: string
  descripcion: string | null
  origen: 'MANUAL'
  creadoEn: string
}

export interface CrearMovimientoBody {
  tipo: TipoMovimiento
  monto: number
  categoria: Categoria
  fecha?: string
  descripcion?: string
}

export type CodigoAlerta =
  | 'CICLO_VENCIDO'
  | 'LIBRE_NEGATIVO'
  | 'AGOTAMIENTO_ANTICIPADO'
  | 'DATOS_INSUFICIENTES'

export interface Alerta {
  codigo: CodigoAlerta
  mensaje: string
}

export interface Resumen {
  hoy: string
  fechaProximoIngreso: string
  fechaEstimada: boolean
  disponible: number
  comprometido: number
  libre: number
  diasRestantes: number
  cupoDiario: number
  cupoHoy: number
  cupoSemana: number
  diasTranscurridos: number
  ritmoDiario: number | null
  saldoProyectado: number | null
  fechaAgotamiento: string | null
  alertas: Alerta[]
}

export type CodigoError =
  | 'VALIDACION'
  | 'NO_ENCONTRADO'
  | 'SIN_CICLO_ACTIVO'
  | 'CICLO_ACTIVO_EXISTENTE'
  | 'NO_AUTENTICADO'
  | 'IA_NO_DISPONIBLE'
  // Solo del cliente (no vienen del contrato):
  | 'SIN_CONEXION'
  | 'ERROR_DESCONOCIDO'

export interface ErrorApi {
  codigo: CodigoError
  mensaje: string
  campos?: Record<string, string>
}
