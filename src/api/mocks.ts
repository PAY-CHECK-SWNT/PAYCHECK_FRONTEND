import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO } from '../lib/categorias'
import { hoyBogota, sumarDias } from '../lib/fechas'
import { ApiError } from './errores'
import type {
  ActualizarCicloBody,
  Categoria,
  Ciclo,
  CrearCicloBody,
  CrearMovimientoBody,
  Health,
  Movimiento,
  Resumen,
} from './tipos'

const RETRASO_MS = 300

let ciclo: Ciclo | null = null
let movimientos: Movimiento[] = []
let siguienteIdCiclo = 1
let siguienteIdMovimiento = 1

const espera = () => new Promise<void>((r) => setTimeout(r, RETRASO_MS))

/** Hora actual en Bogotá con offset fijo -05:00 (Colombia no tiene horario de verano). */
function ahoraBogota(): string {
  const local = new Date(Date.now() - 5 * 60 * 60 * 1000)
  return `${local.toISOString().slice(0, 19)}-05:00`
}

function requerirCiclo(): Ciclo {
  if (!ciclo) throw new ApiError(404, 'NO_ENCONTRADO', 'No tienes un ciclo activo.')
  return ciclo
}

function errorValidacion(campos: Record<string, string>): ApiError {
  return new ApiError(400, 'VALIDACION', 'Revisa los datos del formulario.', campos)
}

/** Resuelve la fecha del próximo ingreso: null/ausente → hoy + 30 y estimada. */
function resolverFechaProximoIngreso(
  fecha: string | null | undefined,
  hoy: string,
): { fechaProximoIngreso: string; fechaEstimada: boolean } {
  if (fecha == null) return { fechaProximoIngreso: sumarDias(hoy, 30), fechaEstimada: true }
  const campos: Record<string, string> = {}
  if (fecha <= hoy) campos.fechaProximoIngreso = 'Debe ser posterior a hoy.'
  else if (fecha > sumarDias(hoy, 62)) {
    campos.fechaProximoIngreso = 'Debe estar dentro de los próximos 62 días.'
  }
  if (Object.keys(campos).length > 0) throw errorValidacion(campos)
  return { fechaProximoIngreso: fecha, fechaEstimada: false }
}

function requerirCicloParaMovimientos(): Ciclo {
  if (!ciclo) throw new ApiError(409, 'SIN_CICLO_ACTIVO', 'Primero configura tu ciclo.')
  return ciclo
}

// Ejemplo del contrato (Caso A). Los mocks no calculan cifras.
const RESUMEN_CASO_A: Resumen = {
  hoy: '2026-10-25',
  fechaProximoIngreso: '2026-11-03',
  fechaEstimada: false,
  disponible: 385000,
  comprometido: 50000,
  libre: 335000,
  diasRestantes: 9,
  cupoDiario: 38888,
  cupoHoy: 23888,
  cupoSemana: 257216,
  diasTranscurridos: 6,
  ritmoDiario: 35833,
  saldoProyectado: 12503,
  fechaAgotamiento: null,
  alertas: [],
}

export const mocks = {
  async health(): Promise<Health> {
    await espera()
    return { estado: 'ok' }
  },

  async crearCiclo(body: CrearCicloBody): Promise<Ciclo> {
    await espera()
    if (ciclo) {
      throw new ApiError(409, 'CICLO_ACTIVO_EXISTENTE', 'Ya tienes un ciclo activo.')
    }
    const hoy = hoyBogota()
    const campos: Record<string, string> = {}
    if (body.saldoInicial == null) campos.saldoInicial = 'Es obligatorio.'
    else if (body.saldoInicial < 0) campos.saldoInicial = 'No puede ser negativo.'
    let proximo: ReturnType<typeof resolverFechaProximoIngreso> | undefined
    try {
      proximo = resolverFechaProximoIngreso(body.fechaProximoIngreso, hoy)
    } catch (err) {
      if (!(err instanceof ApiError)) throw err
      Object.assign(campos, err.campos)
    }
    if (Object.keys(campos).length > 0 || !proximo) throw errorValidacion(campos)
    ciclo = {
      id: siguienteIdCiclo++,
      saldoInicial: body.saldoInicial,
      fechaInicio: hoy,
      ...proximo,
      estado: 'ACTIVO',
    }
    return { ...ciclo }
  },

  async obtenerCicloActivo(): Promise<Ciclo> {
    await espera()
    return { ...requerirCiclo() }
  },

  async actualizarCicloActivo(body: ActualizarCicloBody): Promise<Ciclo> {
    await espera()
    const actual = requerirCiclo()
    ciclo = {
      ...actual,
      ...resolverFechaProximoIngreso(body.fechaProximoIngreso, hoyBogota()),
    }
    return { ...ciclo }
  },

  async crearMovimiento(body: CrearMovimientoBody): Promise<Movimiento> {
    await espera()
    const hoy = hoyBogota()
    const fecha = body.fecha ?? hoy
    const descripcion = body.descripcion?.trim() || null
    const campos: Record<string, string> = {}
    if (body.monto == null) campos.monto = 'Es obligatorio.'
    else if (body.monto <= 0) campos.monto = 'Debe ser mayor que 0.'
    const validas: Categoria[] = body.tipo === 'GASTO' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO
    if (body.categoria == null) campos.categoria = 'Es obligatorio.'
    else if (!validas.includes(body.categoria)) {
      campos.categoria = 'No corresponde al tipo de movimiento.'
    }
    if (fecha > hoy) campos.fecha = 'No puede ser futura.'
    if (descripcion && descripcion.length > 140) campos.descripcion = 'Máximo 140 caracteres.'
    // Los datos se validan antes que el ciclo (400 antes que 409).
    if (Object.keys(campos).length > 0) throw errorValidacion(campos)
    const cicloActivo = requerirCicloParaMovimientos()
    if (fecha < cicloActivo.fechaInicio) {
      throw errorValidacion({ fecha: 'No puede ser anterior al inicio de tu ciclo.' })
    }
    const movimiento: Movimiento = {
      id: siguienteIdMovimiento++,
      tipo: body.tipo,
      monto: body.monto,
      categoria: body.categoria,
      fecha,
      descripcion,
      origen: 'MANUAL',
      creadoEn: ahoraBogota(),
    }
    movimientos = [movimiento, ...movimientos]
    return { ...movimiento }
  },

  async listarMovimientos(): Promise<Movimiento[]> {
    await espera()
    requerirCicloParaMovimientos()
    return [...movimientos].sort(
      (a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn),
    )
  },

  async obtenerResumen(): Promise<Resumen> {
    await espera()
    requerirCiclo()
    return structuredClone(RESUMEN_CASO_A)
  },
}
